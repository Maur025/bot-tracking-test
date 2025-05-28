import { BotAction, botActions } from '@config/bot-actions';
import redisClient from '@config/redis/create-redis-client';
import { loggerDebug, loggerWarn } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';

class BotManager {
	private bots: Map<string, DeviceBotCache> = new Map<string, DeviceBotCache>();
	private readonly TICK_MS: number = 1000;

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

		setInterval(() => {
			const { rss, heapUsed } = process.memoryUsage();
			console.log(
				`[tickLoop] bots: ${this.bots.size}, RAM: ${(
					heapUsed /
					1024 /
					1024
				).toFixed(2)} MB, RSS: ${(rss / 1024 / 1024).toFixed(2)} MB`
			);
		}, 10000);

		this.tickLoop();
	};

	private readonly tickLoop = async (): Promise<void> => {
		const botsArray = Array.from(this.bots?.values());
		const BATCH_SIZE = 50;

		for (let i = 0; i < botsArray.length; i += BATCH_SIZE) {
			const batch = botsArray.slice(i, i + BATCH_SIZE);

			await Promise.all(batch.map(bot => this.tick(bot)));

			await new Promise(resolve => setTimeout(resolve, 20));
		}

		setTimeout(this.tickLoop, this.TICK_MS);
	};

	private readonly tick = async (bot: DeviceBotCache): Promise<void> => {
		const actionToExecute: BotAction = this.chooseWeightAction();

		// actionToExecute.execute(bot);
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
