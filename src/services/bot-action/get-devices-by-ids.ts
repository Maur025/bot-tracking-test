import redisClient from '@config/redis/create-redis-client';

export const getDevicesByids = async (deviceIds: string[]) =>
	Promise.all(
		deviceIds.map((id: string) => redisClient.hGetAll(`device-bot:${id}`))
	);
