import { Kafka } from 'kafkajs';

export const kafkaClient = new Kafka({
	clientId: 'bot-test-server',
	brokers: ['localhost:9092'],
});
