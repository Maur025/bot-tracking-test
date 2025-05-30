import { fileURLToPath } from 'node:url';
import { deviceService } from './database/device-service';
import { dirname, join } from 'node:path';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { loggerDebug, loggerError } from '@maur025/core-logger';

export const syncDataTemp = async () => {
	const deviceQuantity = await deviceService.count();

	if (!deviceQuantity) {
		return;
	}

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const tempFile = join(__dirname, '../cache/device-bot-data-temp.json');

	if (!existsSync(tempFile)) {
		return;
	}

	try {
		const dataCacheTemp: DeviceBotCache[] = JSON.parse(
			readFileSync(tempFile, 'utf-8')
		);

		for (const dataTemp of dataCacheTemp) {
			await deviceService.update(dataTemp.id, {
				lastPosition: {
					type: 'Point',
					coordinates: [Number(dataTemp.lon ?? 0), Number(dataTemp.lat ?? 0)],
				},
			});
		}

		unlinkSync(tempFile);
		loggerDebug(`Synced ${dataCacheTemp.length} devices with temporary data.`);
	} catch (error) {
		loggerError(`Failed to sync devices with temporary data: ${error}`);
	}
};
