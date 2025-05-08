import { socketTrackConnect } from '@socket/client/socket-track-client';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { getWorkersToCreate } from 'util/get-workers-to-create';

const numberCpus = cpus().length;

if (cluster.isPrimary && numberCpus > 2) {
	console.log(`Primary process ${process.pid} is running`);
	socketTrackConnect();

	const workersToCreate: number = getWorkersToCreate(numberCpus);
	let workerIndex: number = 0;

	while (workerIndex < workersToCreate) {
		cluster.fork();

		workerIndex++;
	}

	cluster.on('online', (worker: Worker) => {
		console.log(`Worker ${worker.process.pid} running.`);
	});
} else {
	await import('./worker');
}
