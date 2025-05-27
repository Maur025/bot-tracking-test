import { deviceEvents } from '@config/device-events';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackPayload } from '@services/simulate-movement/get-mei-track-payload';

const { IGNITION_ON, REPLY_CURRENT_PASSIVE } = deviceEvents;

export const botMove = (bot?: DeviceBotCache): void => {
	if (!bot || (bot.lat === '0' && bot.lon === '0')) {
		throw new Error('');
	}

	if (bot.ignition === '0') {
		bot.ignition = '1';
		bot.event = IGNITION_ON;

		const payload: string = getMeiTrackPayload({ bot });

		return;
	}

	bot.event = REPLY_CURRENT_PASSIVE;
	bot.lat = '12.45678';
	bot.lon = '98.65432';
};
