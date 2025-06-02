import env from '@config/env';
import { loggerWarn } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateWait } from './generate-wait';

const { MAX_SPEED_MS } = env;

export const botIncreaseSpeed = async (bot: DeviceBotCache): Promise<void> => {
	if (Number(bot.speedMs) >= MAX_SPEED_MS) {
		loggerWarn(`Max speed reached`);

		return;
	}

	const speedToIncrease: number = 0.1 + Math.random() * 3;

	bot.speedMs = (Number(bot.speedMs) + speedToIncrease).toFixed(2);
	bot.programWait = generateWait(1, 'seconds');
};
