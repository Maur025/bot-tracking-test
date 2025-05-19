import { createKafkaClient } from '@config/kafka/create-kafka-client';

export const kafkaClientWorker = createKafkaClient(`worker-${process.pid}`);
