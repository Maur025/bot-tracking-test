import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateWait } from './generate-wait';
import { loggerDebug } from '@maur025/core-logger';
import env from '@config/env';

const { INITIAL_SPEED_MS } = env;

export const botStay = async (bot: DeviceBotCache): Promise<void> => {
	const timeToStayInMin: number = Math.floor(6 + Math.random() * 10);

	bot.speed = '0.00';
	bot.speedMs = INITIAL_SPEED_MS.toString();
	bot.programWait = generateWait(timeToStayInMin, 'minutes');

	loggerDebug(`device STAY to ${timeToStayInMin} minutes`);
};
