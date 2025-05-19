import { loggerError } from '@maur025/core-logger';

export const getObjectOfString = <T>(stringValue: string): T => {
	try {
		return JSON.parse(stringValue);
	} catch (error) {
		throw new Error(`Found error to convert string to json`, error ?? {});
	}
};

export const getPayloadKafka = <T>(
	message: Buffer<ArrayBufferLike> | null
): T | null => {
	if (!message) {
		loggerError(`MessageKafka null ... or not recived`);
		return null;
	}

	try {
		const value: string = message.toString();
		if (!value) {
			loggerError(`kafka message value is empty, null or undefined`);
			return null;
		}

		return getObjectOfString<T>(value);
	} catch (error) {
		throw new Error(`Payload not handler as string`, error ?? {});
	}
};
