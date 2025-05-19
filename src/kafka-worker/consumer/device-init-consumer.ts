import { sendPositionBot, sendPositionTest } from 'util/bot-script-test';
import { EachMessagePayload } from 'kafkajs';
import { randomNumberBetweenDigits } from '../../util/random-number-between-digits';
import { getBotRoute } from 'service/get-bot-route';
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

	// let index = randomNumberBetweenDigits(1, 2);

	// setInterval(() => {
	// 	sendPositionBot(
	// 		{
	// 			imei: device.imei,
	// 			deviceId: device.referenceCaptureId,
	// 		},
	// 		// index
	// 	);

	// 	// index++;

	// 	// if (index >= getBotRoute().length) {
	// 	// 	index = 0;
	// 	// }
	// }, 5000);
	sendPositionTest(device.imei);
};
