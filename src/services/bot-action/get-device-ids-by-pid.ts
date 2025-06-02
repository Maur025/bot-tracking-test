import redisClient from '@config/redis/create-redis-client';

export const getDeviceIdsByPid = async (): Promise<string[]> =>
	redisClient.sUnion(`bot-process:${process.pid}`);
