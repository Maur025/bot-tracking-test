import { deviceEvents } from '@config/device-events';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackPayload } from '@services/simulate-movement/get-mei-track-payload';
import { getRouteToTravel } from '@services/simulate-movement/get-route-to-travel';
import { emitDataForUdp } from '@utils/emit-data-for-udp';
import { Feature, LineString, Point } from 'geojson';
import {
	distance as distanceTurf,
	lineString as lineStringTurf,
	length as lengthTurf,
	along as alongTurf,
} from '@turf/turf';
import { loggerError } from '@maur025/core-logger';
import { generateWait } from './generate-wait';

const { IGNITION_ON, REPLY_CURRENT_PASSIVE } = deviceEvents;

const INTERVAL = 5;

export const botMove = async (bot?: DeviceBotCache): Promise<void> => {
	if (!bot) {
		loggerError(`invalid bot founded without botData`);
		return;
	}

	if (bot.lat === '0' && bot.lon === '0') {
		return;
	}

	if (bot.ignition === '0') {
		bot.ignition = '1';
		bot.event = IGNITION_ON;

		const payload: string = getMeiTrackPayload({ bot });
		emitDataForUdp(payload);

		bot.programWait = generateWait(1.5, 'seconds');

		return;
	}

	if (!JSON.parse(bot.assignedRoute ?? 'true')) {
		bot.routeTravel = await getRouteToTravel({ bot });

		if (bot.routeTravel?.length < 2) {
			return;
		}

		bot.assignedRoute = 'true';

		const payload: string = getMeiTrackPayload({ bot });
		emitDataForUdp(payload);

		const timeToWait = new Date();
		timeToWait.setSeconds(timeToWait.getSeconds() + 3);

		bot.programWait = generateWait(INTERVAL, 'seconds');

		return;
	}

	if (
		bot.assignedRoute &&
		bot?.routeTravel?.length &&
		bot?.routeTravel?.length >= 2
	) {
		const stepMeter = Number(bot.speedMs) * INTERVAL;
		const pathLine: Feature<LineString> = lineStringTurf([...bot.routeTravel]);
		const pathLineLength: number = lengthTurf(pathLine, { units: 'meters' });

		bot.event = REPLY_CURRENT_PASSIVE;
		bot.speed = (Number(bot.speedMs) * 3.6).toFixed(2);

		bot.distanceCurrentlyTraveled =
			(bot.distanceCurrentlyTraveled ?? 0) + stepMeter;

		if (bot.distanceCurrentlyTraveled >= pathLineLength) {
			bot.assignedRoute = 'false';
			bot.routeTravel.length = 0;
			bot.distanceCurrentlyTraveled = 0;

			return;
		}

		const deviceStep: Feature<Point> = alongTurf(
			pathLine,
			bot.distanceCurrentlyTraveled,
			{ units: 'meters' }
		);

		const [deviceStepLon = 0, deviceStepLat = 0] = deviceStep?.geometry
			?.coordinates ?? [0, 0];

		bot.lon = deviceStepLon.toString();
		bot.lat = deviceStepLat.toString();

		const payload: string = getMeiTrackPayload({ bot });
		emitDataForUdp(payload);

		bot.programWait = generateWait(INTERVAL, 'seconds');
	}
};
