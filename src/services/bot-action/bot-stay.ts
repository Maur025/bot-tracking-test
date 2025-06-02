import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateWait } from './generate-wait';
import { loggerDebug } from '@maur025/core-logger';

export const botStay = async (bot: DeviceBotCache): Promise<void> => {
	const timeToStayInMin: number = Math.floor(1 + Math.random() * 15);

	bot.programWait = generateWait(timeToStayInMin, 'minutes');

	loggerDebug(`device STAY to ${timeToStayInMin} minutes`);
};
