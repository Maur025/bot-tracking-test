import { loggerInfo } from '@maur025/core-logger';
import { EachMessagePayload } from 'kafkajs';
export const deviceLastLocationConsumerHandler = async ({
	message,
}: EachMessagePayload): Promise<void> => {
	const value = message.value?.toString();
	if (!value) {
		return;
	}

	const valueJson = JSON.parse(value);
	// loggerInfo(`data kafka json in worker [${process.pid}] : ${value}`);
};
