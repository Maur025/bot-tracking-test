import { createKafkaClient } from '@config/kafka/create-kafka-client';

export const kafkaClientPrimary = createKafkaClient('bot-test-server');
