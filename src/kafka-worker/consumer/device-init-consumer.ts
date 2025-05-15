import { sendPositionBot } from 'util/bot-script-test';
import { EachMessagePayload } from 'kafkajs';
import { randomNumberBetweenDigits } from '../../util/random-number-between-digits';
import { getBotRoute } from 'service/get-bot-route';

export const deviceInitConsumerHandler = async ({
	topic,
	partition,
	message,
}: EachMessagePayload) => {
	const value = message.value?.toString();
	if (!value) {
		return;
	}

	const valueJson = JSON.parse(value);
	// console.log(valueJson);

	let index = randomNumberBetweenDigits(1, 2);

	setInterval(() => {
		sendPositionBot(
			{
				imei: valueJson.imei,
				deviceId: valueJson.deviceId,
			},
			index
		);

		index++;

		if (index >= getBotRoute().length) {
			index = 0;
		}
	}, 5000);
};
