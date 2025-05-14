import { KafkaTopics } from 'kafka-topics';
import { createConsumer } from './kafka-consumer-worker';
import { deviceInitConsumerHandler } from './consumer/device-init-consumer';

const { DEVICE_INIT } = KafkaTopics;

export const kafkaSubscribeConsumer = async () => {
	const deviceInitConsumer = await createConsumer(DEVICE_INIT, true);
	await deviceInitConsumer.run({ eachMessage: deviceInitConsumerHandler });
};
