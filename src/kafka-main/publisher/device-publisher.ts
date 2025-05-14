import { KafkaTopics } from 'kafka-topics';
import { publish } from '../kafka-producer';
import { Device } from '@models/data/device';

const { DEVICE_INIT } = KafkaTopics;

export const devicePublisher = async (device: Device): Promise<void> => {
	await publish({ topic: DEVICE_INIT, message: JSON.stringify(device) });
};
