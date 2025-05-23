import redisClient from '@config/redis/create-redis-client';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackCheckSum } from 'util/get-mei-track-check-sum-hex';
import { getMeiTrackDate } from 'util/get-mei-track-date';
import { getMeiTrackPayloadLength } from 'util/get-mei-track-payload-length';

interface Request {
	key: string;
}

export const getMeiTrackPayload = async ({ key }: Request): Promise<string> => {
	const {
		imei,
		cmd,
		event,
		lat,
		lon,
		stateGps,
		usedSatellites,
		acc,
		speed,
		odometer,
		bateryLevel,
		ignition,
		analog,
		einfo,
		custom,
	}: Partial<DeviceBotCache> = await redisClient.hGetAll(key);

	const dateFormated: string = getMeiTrackDate();

	const payloadBody: string = `${imei},${cmd},${event},${lat},${lon},${dateFormated},${stateGps},${usedSatellites},${acc},${speed},0,0,0,0,${odometer},${bateryLevel},${ignition},${analog},${einfo},${custom}`;

	await redisClient.hSet(key, 'date', dateFormated);

	return `$$${getMeiTrackPayloadLength(
		payloadBody
	)},${payloadBody}*${getMeiTrackCheckSum(payloadBody)}`;
};
