import { Position } from 'geojson';
import { generateValidLocation } from './generate-valid-location';
import redisClient from '@config/redis/create-redis-client';

interface Request {
	key: string;
	lon: string | null;
	lat: string | null;
}

export const initDevicePosition = async ({
	key,
	lon,
	lat,
}: Request): Promise<void> => {
	if (lon !== '0' && lat !== '0') {
		return;
	}

	const [newLon, newLat]: Position = await generateValidLocation();

	await redisClient.hSet(key, {
		lon: newLon.toString(),
		lat: newLat.toString(),
	});
};
