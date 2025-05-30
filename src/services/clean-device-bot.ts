import redisClient from '@config/redis/create-redis-client';
import { loggerError, loggerInfo } from '@maur025/core-logger';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';

export const cleanDeviceBot = async (): Promise<void> => {
	if (!redisClient) {
		return;
	}

	const keys = await redisClient.keys('device-bot:*');

	if (!keys.length) {
		return;
	}

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const dataToSave = [];

	for (const key of keys) {
		const data = await redisClient.hGetAll(key);
		dataToSave.push(data);
	}

	const stringToSave = JSON.stringify(dataToSave);

	try {
		writeFileSync(
			join(__dirname, '../cache/device-bot-data-temp.json'),
			stringToSave,
			'utf-8'
		);

		loggerInfo('data save successfull');
	} catch (error) {
		loggerError(`data save failed: ${error}`);
	}

	await redisClient.del(keys);
	loggerInfo(`[redis-primary] Device bot cache clean successfull`);
};
