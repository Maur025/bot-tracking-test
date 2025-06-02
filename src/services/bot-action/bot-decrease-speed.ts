import env from '@config/env';
import { loggerWarn } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateWait } from './generate-wait';

const { MIN_SPEED_MS } = env;

export const botDecreaseSpeed = async (bot: DeviceBotCache): Promise<void> => {
	if (Number(bot.speedMs) <= MIN_SPEED_MS) {
		loggerWarn(`Min speed reached`);

		return;
	}

	const speedToDecrease: number = 0.1 + Math.random() * 3;

	bot.speedMs = (Number(bot.speedMs) - speedToDecrease).toFixed(2);
	bot.programWait = generateWait(1, 'seconds');
};
