import env from '@config/env';
import { loggerError, loggerInfo } from '@maur025/core-logger';
import cluster from 'cluster';
import { createClient } from 'redis';

const { REDIS_HOST, REDIS_PORT } = env;

const redisClient = createClient({
	url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
})
	.on('error', error => loggerError(`Redis client error: `, error))
	.on('ready', () =>
		loggerInfo(
			`[redis-${
				cluster.isPrimary ? 'Primary' : `worker-${process.pid}`
			}] redis client running in http://${REDIS_HOST}:${REDIS_PORT}`
		)
	);

export const initRedisClient = async () => {
	await redisClient.connect();
};

export default redisClient;
