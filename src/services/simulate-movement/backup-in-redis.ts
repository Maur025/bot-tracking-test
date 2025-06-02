import redisClient from '@config/redis/create-redis-client';
import { DeviceBotCache } from '@models/data/device-bot-cache';

export const backupInRedis = async (
	bots: Map<string, DeviceBotCache>
): Promise<void> => {
	for (const deviceBot of bots?.values()) {
		await redisClient.hSet(`device-bot:${deviceBot.id}`, {
			date: deviceBot.date,
			lon: deviceBot.lon,
			lat: deviceBot.lat,
		});
	}
};
