import { Kafka, LogEntry, logLevel } from 'kafkajs';
import { kafkaLogEntryHandler } from 'util/kafka-log-entry-handler';

const KAFKA_SERVER_ID = 'Kafka-main';

export const kafkaClient = new Kafka({
	clientId: 'bot-test-server',
	brokers: ['localhost:9092'],
	logLevel: logLevel.DEBUG,
	logCreator: () => (entry: LogEntry) =>
		kafkaLogEntryHandler(entry, KAFKA_SERVER_ID),
});
