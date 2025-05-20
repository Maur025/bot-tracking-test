import redisClient from '@config/redis/create-redis-client';
import { AllWays } from '@models/data/all-ways';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDistance } from 'ol/sphere';

export const initWayGraph = async () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const allWays: AllWays = JSON.parse(
		readFileSync(join(__dirname, '../config/only-vehicle-ways.json'), 'utf8')
	);

	for (const way of allWays.vehicleWays) {
		const coordList: [number, number][] = way.geometry?.coordinates;

		const startLine: [number, number] = coordList[0];
		const endLine: [number, number] = coordList[coordList.length - 1];

		for (const wayRef of allWays.vehicleWays) {
			if (wayRef.id === way.id) {
				continue;
			}

			const coordListRef: [number, number][] = wayRef.geometry?.coordinates;

			const startLineRef: [number, number] = coordListRef[0];
			const endLineRef: [number, number] =
				coordListRef[coordListRef.length - 1];

			const distanceStart: number = getDistance(startLine, startLineRef);
			const distanceEnd: number = getDistance(startLine, endLineRef);

			const distenceEndStart: number = getDistance(endLine, startLineRef);
			const distanceEndEnd: number = getDistance(endLine, endLineRef);

			if (distanceStart < 5 || distanceEnd < 5) {
				way.startConnections = [
					...(way.startConnections ?? []),
					wayRef.id ?? '',
				];
			}

			if (distenceEndStart < 5 || distanceEndEnd < 5) {
				way.endConnections = [...(way.endConnections ?? []), wayRef.id ?? ''];
			}
		}

		console.log(way);
	}
};

const setGraphCache = async (key: string, value: any) => {
	await redisClient.set(key, JSON.stringify(value));
};
