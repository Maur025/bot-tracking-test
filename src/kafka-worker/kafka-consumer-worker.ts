import { kafkaClientWorker } from './kafka-client-worker';

export const createConsumer = async (
	topic: string,
	fromBeginning: boolean = false
) => {
	const consumerWorker = kafkaClientWorker.consumer({
		groupId: 'worker-bot-group',
	});

	await consumerWorker.connect();
	await consumerWorker.subscribe({ topic, fromBeginning });

	return consumerWorker;
};
