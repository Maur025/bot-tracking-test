import { DeviceCurrentLocation } from '@models/data/device-current-location';
import { publish } from '../kafka-producer';
import { KafkaTopics } from '@src/kafka-topics';

const { DEVICE_LAST_LOCATION } = KafkaTopics;

export const deviceLastLocationPublisher = async (
	deviceCurrentLocation: DeviceCurrentLocation
) => {
	await publish({
		topic: DEVICE_LAST_LOCATION,
		message: JSON.stringify(deviceCurrentLocation),
	});
};
