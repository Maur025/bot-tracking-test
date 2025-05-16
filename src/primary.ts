import 'dotenv/config';
import { socketTrackConnect } from '@socket/client/socket-track-client';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { getWorkersToCreate } from 'util/get-workers-to-create';
import { initializeProducer } from 'kafka-main/kafka-producer';
import { loggerInfo } from '@maur025/core-logger';
import { createServer, Server } from 'node:http';
import { setupMaster } from '@socket.io/sticky';
import { setupPrimary } from '@socket.io/cluster-adapter';
import env from '@config/env';
import { initializeBotDevice } from 'service/initialize-bot-device';

const numberCpus = cpus().length;

if (cluster.isPrimary && numberCpus > 2) {
	loggerInfo(`Primary process [${process.pid}] is running`);

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

	httpServer.listen(env.PORT, () => {
		loggerInfo(
			`[primary] express and socket gateway running on port [${env.PORT}]`
		);
	});

	const workersToCreate: number = getWorkersToCreate(numberCpus);
	let workerIndex: number = 0;

	while (workerIndex < workersToCreate) {
		cluster.fork();

		workerIndex++;
	}

	cluster.on('online', (worker: Worker) => {
		loggerInfo(`Worker [${worker.process.pid}] running.`);
	});

	await initializeBotDevice();
} else {
	await import('./index');
}
