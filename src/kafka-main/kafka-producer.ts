import { Partitioners } from 'kafkajs';
import { kafkaClient } from './kafka-client';
import { v4 as uuidv4 } from 'uuid';

const producer = kafkaClient.producer({
	createPartitioner: Partitioners.LegacyPartitioner,
});

export const initializeProducer = async () => {
	await producer.connect();
};

export const publish = async ({
	topic,
	message,
	key,
}: {
	topic: string;
	message: string;
	key?: string;
}) => {
	if (!producer) {
		console.error(`Send Failed, producer not initialized.`);
		return;
	}

	await producer.send({
		topic,
		messages: [{ key: key ?? uuidv4(), value: message }],
	});
};
