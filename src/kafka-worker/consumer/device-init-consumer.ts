import { sendPositionTest } from 'util/bot-script-test';
import { EachMessagePayload } from 'kafkajs';
import { IDevice } from '@models/schema/device-schema';
import { getPayloadKafka } from 'util/json-util';

export const deviceInitConsumerHandler = async ({
	topic,
	partition,
	message,
}: EachMessagePayload): Promise<void> => {
	const device: IDevice | null = getPayloadKafka<IDevice>(message.value);

	if (!device) {
		return;
	}

	sendPositionTest(device.imei);
};
