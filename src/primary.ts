import 'dotenv/config';
import { socketTrackConnect } from '@socket/client/socket-track-client';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { loggerDebug, loggerInfo } from '@maur025/core-logger';
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

	cluster.on('exit', () => {});

	await registerWayToDatabase();

	await initWayGraph();
	await initializeBotDevice();

	process.on('SIGINT', async () => {
		for (const id in cluster.workers) {
			cluster.workers[id]?.process.kill('SIGINT');
		}
		try {
			await cleanDeviceBot();
			await disconnectDatabase();

			if (redisClient) {
				await redisClient.quit();
			}

			httpServer.close(() => {
				console.log('[shutdown] server close');

				setTimeout(() => process.exit(0), 100);
			});
		} catch (error) {
			console.error('[shutdown] error in close server', error);
			setTimeout(() => process.exit(1), 100);
		}
	});

	process.on('SIGTERM', async () => {
		for (const id in cluster.workers) {
			cluster.workers[id]?.process.kill('SIGINT');
		}
		try {
			await cleanDeviceBot();
			await disconnectDatabase();

			if (redisClient) {
				await redisClient.quit();
			}

			httpServer.close(() => {
				console.log('[shutdown] server close');

				setTimeout(() => process.exit(0), 100);
			});
		} catch (error) {
			console.error('[shutdown] error in close server', error);
			setTimeout(() => process.exit(1), 100);
		}
	});

	process.on('exit', () => {
		loggerInfo(`[primary] server shutdown with safe exit`);
		process.exit(0);
	});
} else {
	await import('./index');
}
