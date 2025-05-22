import 'dotenv/config';
import { socketTrackConnect } from '@socket/client/socket-track-client';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { getWorkersToCreate } from 'util/get-workers-to-create';
import { initializeProducer } from 'kafka-main/kafka-producer';
import { loggerDebug, loggerInfo } from '@maur025/core-logger';
import { createServer, Server } from 'node:http';
import { setupMaster } from '@socket.io/sticky';
import { setupPrimary } from '@socket.io/cluster-adapter';
import env from '@config/env';
import { initializeBotDevice } from 'service/initialize-bot-device';
import {
	connectToDabase,
	disconnectDatabase,
} from '@config/database/database-config';
import { initWayGraph } from 'service/init-way-graph';
import redisClient, {
	initRedisClient,
} from '@config/redis/create-redis-client';
import { registerWayToDatabase } from 'service/register-way-to-database';
import { cleanDeviceBot } from 'service/clean-device-bot';

const numberCpus = cpus().length;

if (cluster.isPrimary && numberCpus > 2) {
	loggerDebug(`Primary process [${process.pid}] is running`);

	await initializeProducer();
	socketTrackConnect();

	const httpServer: Server = createServer();
	setupMaster(httpServer, {
		loadBalancingMethod: 'least-connection',
	});

	setupPrimary();

	cluster.setupPrimary({
		serialization: 'advanced',
	});

	await initRedisClient();

	await connectToDabase();

	httpServer.listen(env.PORT, () => {
		loggerInfo(
			`[primary] express and socket gateway running on http://0.0.0.0:${env.PORT}`
		);
	});

	const workersToCreate: number = getWorkersToCreate(numberCpus);
	let workerIndex: number = 0;

	while (workerIndex < workersToCreate) {
		cluster.fork();

		workerIndex++;
	}

	cluster.on('online', (worker: Worker) => {
		loggerDebug(`Worker [${worker.process.pid}] running.`);
	});

	await registerWayToDatabase();

	await initWayGraph();
	await initializeBotDevice();

	process.on('SIGINT', async () => {
		await cleanDeviceBot();
		await disconnectDatabase();

		if (redisClient) {
			await redisClient.quit();
		}

		httpServer.close();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		await cleanDeviceBot();
		await disconnectDatabase();

		if (redisClient?.isOpen) {
			await redisClient.quit();
		}

		httpServer.close();
		process.exit(0);
	});

	process.on('exit', () => {
		loggerInfo(`[primary] server shutdown with safe exit`);
		process.exit(0);
	});
} else {
	await import('./index');
}
