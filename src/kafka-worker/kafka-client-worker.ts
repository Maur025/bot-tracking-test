import { Kafka } from 'kafkajs';

export const kafkaClientWorker = new Kafka({
	clientId: `worker-${process.pid}`,
	brokers: ['localhost:9092'],
});
