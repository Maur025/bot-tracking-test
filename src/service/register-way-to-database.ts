import { fileURLToPath } from 'url';
import { wayService } from './database/way-service';
import { dirname, join } from 'path';
import { AllWays } from '@models/data/all-ways';
import { readFileSync } from 'fs';
import { loggerInfo } from '@maur025/core-logger';

export const registerWayToDatabase = async (): Promise<void> => {
	const wayCount: number = await wayService.count();
	if (wayCount) {
		loggerInfo(`[primary] Data ways already created ... skiping`);
		return;
	}

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const allWays: AllWays = JSON.parse(
		readFileSync(join(__dirname, '../config/only-vehicle-ways.json'), 'utf8')
	);

	for (const way of allWays.vehicleWays) {
		await wayService.save({
			geometry: { ...way.geometry },
			properties: {
				name: way.properties.name,
				highway: way.properties.highway ?? '',
				surface: way.properties.surface ?? '',
			},
			referenceId: way.id || '',
		});
	}
};
