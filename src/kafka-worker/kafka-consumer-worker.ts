import { Consumer } from 'kafkajs';
import { kafkaClientWorker } from './kafka-client-worker';

export const createConsumer = async (): Promise<Consumer> => {
	const consumerWorker: Consumer = kafkaClientWorker.consumer({
		groupId: 'worker-bot-group',
	});

	await consumerWorker.connect();

	return consumerWorker;
};
