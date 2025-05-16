import { EachMessagePayload } from 'kafkajs';
import type { DeviceCurrentLocation } from '../../models/data/device-current-location';
import {
	SingleIoResponse,
	SingleIoResponseBuilder,
} from '@maur025/core-model-data';
import { v4 as uuidv4 } from 'uuid';
import { getIo } from '@socket/server/init-socket-server';
import { SocketRoom } from 'socket-room';
import { SocketTopic } from 'socket-topics';

const { DEVICE_LOCATION_LAST } = SocketTopic;
const { MONITOR_ALL_DEVICES } = SocketRoom;

export const deviceLastLocationConsumerHandler = async ({
	message,
}: EachMessagePayload): Promise<void> => {
	const value = message.value?.toString();
	if (!value) {
		return;
	}

	const deviceCurrentLocation: DeviceCurrentLocation = JSON.parse(value);

	const payloadToResponse: SingleIoResponse<DeviceCurrentLocation> =
		SingleIoResponseBuilder.builder<DeviceCurrentLocation>()
			.withResponse({
				id: uuidv4(),
				eventType: 'device-location:last',
				timestamp: new Date().toISOString(),
				data: deviceCurrentLocation,
				message: 'last location was updated',
			})
			.build();

	getIo().to(MONITOR_ALL_DEVICES).emit(DEVICE_LOCATION_LAST, payloadToResponse);
};
