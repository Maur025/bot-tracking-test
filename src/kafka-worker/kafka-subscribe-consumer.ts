import { createConsumer } from './kafka-consumer-worker';
import { deviceInitConsumerHandler } from './consumer/device-init-consumer';
import { deviceLastLocationConsumerHandler } from './consumer/device-last-location';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { loggerWarn } from '@maur025/core-logger';
import { KafkaTopics } from '@src/kafka-topics';

const { DEVICE_INIT, DEVICE_LAST_LOCATION } = KafkaTopics;

export const kafkaSubscribeConsumer = async () => {
	const consumerWorker: Consumer = await createConsumer();

	consumerWorker.subscribe({ topic: DEVICE_INIT, fromBeginning: true });
	consumerWorker.subscribe({
		topics: [DEVICE_LAST_LOCATION],
		fromBeginning: false,
	});

	consumerWorker.run({
		eachMessage: async (payload: EachMessagePayload) => {
			switch (payload.topic) {
				case DEVICE_INIT:
					deviceInitConsumerHandler(payload);
					break;
				case DEVICE_LAST_LOCATION:
					deviceLastLocationConsumerHandler(payload);
					break;
				default:
					loggerWarn(`unkonwn topic payload, skiping... `);
			}
		},
	});
};
