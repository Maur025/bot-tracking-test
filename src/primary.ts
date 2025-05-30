import 'dotenv/config';
import { socketTrackConnect } from '@socket/client/socket-track-client';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { loggerDebug, loggerError, loggerInfo } from '@maur025/core-logger';
import { createServer, Server } from 'node:http';
import { setupMaster } from '@socket.io/sticky';
import env from '@config/env';
import {
	connectToDabase,
	disconnectDatabase,
} from '@config/database/database-config';
import redisClient, {
	initRedisClient,
} from '@config/redis/create-redis-client';
import { socketBridgeConnect } from '@socket/client/socket-bridge-client';
import { initializeProducer } from '@kafkaMain/kafka-producer';
import { getWorkersToCreate } from '@utils/get-workers-to-create';
import { registerWayToDatabase } from '@services/register-way-to-database';
import { initWayGraph } from '@services/init-way-graph';
import { initializeBotDevice } from '@services/initialize-bot-device';
import { cleanDeviceBot } from '@services/clean-device-bot';
import cleanup from 'node-cleanup';
import { syncDataTemp } from '@services/sync-data-temp';

const numberCpus = cpus().length;

if (cluster.isPrimary && numberCpus > 2) {
	loggerDebug(`Primary process [${process.pid}] is running`);

	await initializeProducer();
	socketTrackConnect();

	const httpServer: Server = createServer();
	setupMaster(httpServer, {
		loadBalancingMethod: 'least-connection',
	});

	cluster.setupPrimary({
		serialization: 'advanced',
	});

	await initRedisClient();

	await connectToDabase();

	socketBridgeConnect();

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

	await syncDataTemp();
	await initializeBotDevice();

	let shuttingdown: boolean = false;

	cleanup((exitCode, signal) => {
		if (shuttingdown) {
			return;
		}

		shuttingdown = true;
		loggerInfo(`[primary] shutting down...`);
		return false;
	});

	process.on('SIGINT', async () => {
		await cleanDeviceBot();
		await disconnectDatabase();

		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		await cleanDeviceBot();
		await disconnectDatabase();

		process.exit(0);
	});
} else {
	await import('./index');
}
