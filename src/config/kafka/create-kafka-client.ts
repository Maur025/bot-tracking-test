import env from '@config/env';
import { Kafka, LogEntry, logLevel } from 'kafkajs';
import { kafkaLogEntryHandler } from 'util/kafka-log-entry-handler';

export const createKafkaClient = (clientId: string): Kafka => {
	return new Kafka({
		clientId,
		brokers: [env.KAFKA_BROKER],
		logLevel: logLevel.DEBUG,
		logCreator: () => (entry: LogEntry) =>
			kafkaLogEntryHandler(entry, `kafka-${clientId}`),
	});
};
