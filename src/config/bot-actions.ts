import { loggerDebug } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { botDecreaseSpeed } from '@services/bot-action/bot-decrease-speed';
import { botIncreaseSpeed } from '@services/bot-action/bot-increase-speed';
import { botMove } from '@services/bot-action/bot-move';
import { botStay } from '@services/bot-action/bot-stay';

export interface BotAction {
	name: string;
	weight: number;
	execute: (bot: DeviceBotCache) => Promise<void>;
}

export const botActions: BotAction[] = [
	{
		name: 'move',
		weight: 85,
		execute: botMove,
	},
	{
		name: 'increase speed',
		weight: 4,
		execute: botIncreaseSpeed,
	},
	{
		name: 'reduce speed',
		weight: 3,
		execute: botDecreaseSpeed,
	},
	{
		name: 'stay',
		weight: 7,
		execute: botStay,
	}, // cuando se supere un numero de minutos se apagara el motor tanto el tiempo de espera como el tiempo antes de apagar seran aleatorios
	{
		name: 'deviate',
		weight: 1,
		execute: async bot => loggerDebug('bot deviate or change route'),
	},
];
