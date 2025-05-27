import { EachMessagePayload } from 'kafkajs';
import { IDevice } from '@models/schema/device-schema';
import redisClient from '@config/redis/create-redis-client';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getPayloadKafka } from '@src/utils/json-util';

export const deviceInitConsumerHandler = async ({
	topic,
	partition,
	message,
}: EachMessagePayload): Promise<void> => {
	const device: IDevice | null = getPayloadKafka<IDevice>(message.value);

	if (!device) {
		return;
	}

	const [lon = 0, lat = 0] = device.lastPosition?.coordinates ?? [0, 0];

	const deviceBotCache: DeviceBotCache = {
		id: device._id,
		referenceCaptureId: device.referenceCaptureId,
		name: device.name,
		imei: device.imei,
		cmd: 'AAA',
		event: '0',
		lat: lat.toString(),
		lon: lon.toString(),
		date: '',
		stateGps: 'A',
		usedSatellites: '0',
		acc: '10',
		speed: '0.00',
		odometer: '0',
		bateryLevel: '0',
		ignition: '0',
		analog: '0',
		einfo: '0',
		custom: '0',
		running: 'true',
		inMovement: 'false',
	};

	await redisClient.hSet(`device-bot:${device._id}`, { ...deviceBotCache });
	await redisClient.sAdd(`bot-process:${process.pid}`, device._id);
};
