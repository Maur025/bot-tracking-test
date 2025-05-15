import 'dotenv/config';
import { socketTrackConnect } from '@socket/client/socket-track-client';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { getWorkersToCreate } from 'util/get-workers-to-create';
import { imeiDeviceList } from '@config/imet-to-test';
import { initializeProducer } from 'kafka-main/kafka-producer';
import { devicePublisher } from 'kafka-main/publisher/device-publisher';
import { loggerInfo } from '@maur025/core-logger';

const numberCpus = cpus().length;

if (cluster.isPrimary && numberCpus > 2) {
	loggerInfo(`Primary process [${process.pid}] is running`);

	await initializeProducer();
	socketTrackConnect();

	const workersToCreate: number = getWorkersToCreate(numberCpus);
	let workerIndex: number = 0;

	while (workerIndex < workersToCreate) {
		cluster.fork();

		workerIndex++;
	}

	cluster.on('online', (worker: Worker) => {
		loggerInfo(`Worker [${worker.process.pid}] running.`);
	});

	for (const imeiDevice of imeiDeviceList) {
		await devicePublisher({
			deviceId: imeiDevice.imei.toString(16),
			imei: imeiDevice.imei,
		});
	}
} else {
	await import('./index');
}
