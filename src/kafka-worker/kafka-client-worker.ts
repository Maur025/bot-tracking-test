import { Kafka, LogEntry, logLevel } from 'kafkajs';
import { kafkaLogEntryHandler } from 'util/kafka-log-entry-handler';

const KAFKA_WORKER_ID = `Kafka-worker-${process.pid}`;

export const kafkaClientWorker = new Kafka({
	clientId: `worker-${process.pid}`,
	brokers: ['localhost:9092'],
	logLevel: logLevel.DEBUG,
	logCreator: () => (entry: LogEntry) =>
		kafkaLogEntryHandler(entry, KAFKA_WORKER_ID),
});
