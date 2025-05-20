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
import { connectToDabase } from '@config/database/database-config';
import { initWayGraph } from 'service/init-way-graph';
import { initRedisClient } from '@config/redis/create-redis-client';

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

	await initWayGraph();
	await initializeBotDevice();
} else {
	await import('./index');
}
