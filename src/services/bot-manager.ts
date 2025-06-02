import { BotAction, botActions } from '@config/bot-actions';
import redisClient from '@config/redis/create-redis-client';
import { loggerWarn } from '@maur025/core-logger';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { simulateDelay } from './simulate-movement/simulate-delay';
import { generateValidLocation } from './simulate-movement/generate-valid-location';
import { programAction } from './program-action';
import { backupInRedis } from './simulate-movement/backup-in-redis';
import { getDeviceIdsByPid } from './bot-action/get-device-ids-by-pid';
import { getDevicesByids } from './bot-action/get-devices-by-ids';
import { setMemoryMonitor } from '@utils/set-memory-monitor';

class BotManager {
	private readonly BATCH_SIZE = 50;
	private readonly bots: Map<string, DeviceBotCache> = new Map<
		string,
		DeviceBotCache
	>();

	private isRunning = false;

	public readonly initializeBots = async (): Promise<void> => {
		const deviceIds: string[] = await getDeviceIdsByPid();

		if (!deviceIds.length) {
			loggerWarn(`Device ids not founded ... skiping initialization`);
			return;
		}

		const deviceList: any[] = await getDevicesByids(deviceIds);

		deviceIds.length = 0;

		await this.assignValidCoords(deviceList);

		for (const device of deviceList) {
			this.bots.set(device.id, { ...device });
		}

		programAction({
			interval: 10,
			lastActionDate: Date.now(),
			action: () => setMemoryMonitor('bot-loop w', `bots: ${this.bots?.size}`),
			units: 'seconds',
		});

		programAction({
			interval: 15,
			lastActionDate: Date.now(),
			action: () => backupInRedis(this.bots),
			units: 'minutes',
		});

		this.startBots();
	};

	private readonly assignValidCoords = async (
		deviceList: any
	): Promise<void> => {
		for (const device of deviceList) {
			if (
				device.lat &&
				device.lat !== '0' &&
				device.lon &&
				device.lon !== '0'
			) {
				continue;
			}

			const newPosition = generateValidLocation();
			device.lon = newPosition[0];
			device.lat = newPosition[1];

			await redisClient.hSet(`device-bot:${device.id}`, {
				lon: newPosition[0].toString(),
				lat: newPosition[1].toString(),
			});
		}
	};

	public readonly startBots = (): void => {
		if (this.isRunning) return;

		this.isRunning = true;
		this.tickLoop();
	};

	public readonly stopBots = (): void => {
		if (!this.isRunning) return;

		this.isRunning = false;
	};

	private readonly tickLoop = async (): Promise<void> => {
		const botsArray = Array.from(this.bots?.values());

		for (let i = 0; i < botsArray.length; i += this.BATCH_SIZE) {
			const batch = botsArray.slice(i, i + this.BATCH_SIZE);

			const dateNow = new Date();

			await Promise.all(
				batch.map(bot => {
					if (!bot.programWait) {
						return this.tick(bot);
					}

					if (dateNow >= bot.programWait) {
						bot.programWait = undefined;
						return this.tick(bot);
					}

					return Promise.resolve();
				})
			);

			await simulateDelay(0.03);
		}

		await simulateDelay(0.5);

		botsArray.length = 0;

		if (this.isRunning) {
			this.tickLoop();
		}
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
