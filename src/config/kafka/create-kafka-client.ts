import env from '@config/env';
import { kafkaLogEntryHandler } from '@utils/kafka-log-entry-handler';
import { Kafka, LogEntry, logLevel } from 'kafkajs';

export const createKafkaClient = (clientId: string): Kafka => {
	return new Kafka({
		clientId,
		brokers: [env.KAFKA_BROKER],
		logLevel: logLevel.INFO,
		logCreator: () => (entry: LogEntry) =>
			kafkaLogEntryHandler(entry, `kafka-${clientId}`),
	});
};
