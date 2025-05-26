import { BotAction, botActions } from '@config/bot-actions';
import redisClient from '@config/redis/create-redis-client';
import { loggerDebug, loggerWarn } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';

class BotManager {
	private bots: Map<string, DeviceBotCache> = new Map<string, DeviceBotCache>();
	private readonly TICK_MS: number = 500;

	public readonly initializeBots = async (): Promise<void> => {
		const deviceIds: string[] = await redisClient.sUnion(
			`bot-process:${process.pid}`
		);

		if (!deviceIds.length) {
			loggerWarn(`Device ids not founded ... skiping initialization`);
			return;
		}

		const deviceList: any[] = await Promise.all(
			deviceIds.map(async id => {
				return await redisClient.hGetAll(`device-bot:${id}`);
			})
		);

		for (const device of deviceList) {
			this.bots.set(device.id, { ...device });
		}

		loggerDebug(`[bot-manager] bots initialized... starting`);

		this.tickLoop();
	};

	private readonly tickLoop = async (): Promise<void> => {
		const now = Date.now();

		const botUpdates = [];

		for (const bot of this.bots.values()) {
			botUpdates.push(this.tick(bot));
		}

		await Promise.all(botUpdates);

		setTimeout(this.tickLoop, this.TICK_MS);
	};

	private readonly tick = async (bot: DeviceBotCache): Promise<void> => {
		const actionToExecute: BotAction = this.chooseWeightAction();

		actionToExecute.execute(bot);
	};

	private readonly chooseWeightAction = (): BotAction => {
		const totalWeight: number = botActions.reduce(
			(sum, action) => sum + action.weight,
			0
		);

		const randomWeight: number = Math.random() * totalWeight;

		let weightActionSum: number = 0;

		for (const action of botActions) {
			weightActionSum += action.weight;

			if (randomWeight <= weightActionSum) {
				return action;
			}
		}

		return botActions[0];
	};
}

export const botManager = new BotManager();
