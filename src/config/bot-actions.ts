import { loggerDebug } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';

export interface BotAction {
	name: string;
	weight: number;
	execute: (bot: DeviceBotCache) => Promise<void>;
}

export const botActions: BotAction[] = [
	{
		name: 'move',
		weight: 40,
		execute: async bot => loggerDebug('bot moving'),
	},
	{
		name: 'increase speed',
		weight: 20,
		execute: async bot => loggerDebug('bot increasing speed'),
	},
	{
		name: 'reduce speed',
		weight: 20,
		execute: async bot => loggerDebug('bot reducing speed'),
	},
	{
		name: 'stay',
		weight: 10,
		execute: async bot => loggerDebug('bot stay to n minutes/hours'),
	},
	{
		name: 'power off',
		weight: 5,
		execute: async bot => loggerDebug('bot power off to n minutes/hours'),
	},
	{
		name: 'deviate',
		weight: 5,
		execute: async bot => loggerDebug('bot deviate or change route'),
	},
];
