import { KafkaTopics } from 'kafka-topics';
import { publish } from '../kafka-producer';
import { IDevice } from '@models/schema/device-schema';

const { DEVICE_INIT } = KafkaTopics;

export const devicePublisher = async (
	device: Partial<IDevice>
): Promise<void> => {
	await publish({ topic: DEVICE_INIT, message: JSON.stringify(device) });
};
