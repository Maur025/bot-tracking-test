import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateWait } from './generate-wait';
import { loggerDebug } from '@maur025/core-logger';
import env from '@config/env';
import { getMilliseconds } from '../program-action';
import { deviceEvents } from '@config/device-events';
import { getMeiTrackPayload } from '@services/simulate-movement/get-mei-track-payload';
import { emitDataForUdp } from '@utils/emit-data-for-udp';

const { INITIAL_SPEED_MS } = env;
const { REPLY_CURRENT_PASSIVE, IGNITION_OFF } = deviceEvents;

export const botStay = async (bot: DeviceBotCache): Promise<void> => {
	const timeToStayInMin: number = Math.floor(6 + Math.random() * 10);

	bot.speed = '0.00';
	bot.speedMs = INITIAL_SPEED_MS.toString();
	bot.programWait = generateWait(timeToStayInMin, 'minutes');

	for (let index = 1; index < timeToStayInMin - 1; index++) {
		let eventToEmit = REPLY_CURRENT_PASSIVE;
		const milliseconds = getMilliseconds(index, 'minutes');

		if (timeToStayInMin > 12 && index === 12) {
			eventToEmit = IGNITION_OFF;
			bot.ignition = '0';
		}

		bot.event = eventToEmit;

		setTimeout(() => {
			const payload = getMeiTrackPayload({ bot: { ...bot } });
			emitDataForUdp(payload);
		}, milliseconds);
	}

	loggerDebug(
		`device ${bot.referenceCaptureId} STAY to ${timeToStayInMin} minutes`
	);
};
