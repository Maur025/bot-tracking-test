import { KafkaTopics } from '@src/kafka-topics';
import { IDevice } from '@models/schema/device-schema';
import { publish } from '../kafka-producer';

const { DEVICE_INIT } = KafkaTopics;

export const devicePublisher = async (
	device: Partial<IDevice>
): Promise<void> => {
	await publish({ topic: DEVICE_INIT, message: JSON.stringify(device) });
};
