import { deviceEvents } from '@config/device-events';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateValidLocation } from '@services/simulate-movement/generate-valid-location';
import { getMeiTrackPayload } from '@services/simulate-movement/get-mei-track-payload';
import { getRouteToTravel } from '@services/simulate-movement/get-route-to-travel';
import { simulateDelay } from '@services/simulate-movement/simulate-delay';
import { emitDataForUdp } from '@utils/emit-data-for-udp';
import { Feature, LineString, Point, Position } from 'geojson';
import {
	distance as distanceTurf,
	lineString as lineStringTurf,
	length as lengthTurf,
	along as alongTurf,
	point,
	pointToLineDistance,
} from '@turf/turf';
import { loggerError } from '@maur025/core-logger';

const { IGNITION_ON, REPLY_CURRENT_PASSIVE } = deviceEvents;

const SPEED = 13;
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

		const timeToWait = new Date();
		timeToWait.setSeconds(timeToWait.getSeconds() + 1.5);

		bot.programWait = timeToWait;

		return;
	}

	if (!JSON.parse(bot.assignedRoute ?? 'true')) {
		bot.routeTravel = await getRouteToTravel({ bot });
		bot.assignedRoute = 'true';

		const payload: string = getMeiTrackPayload({ bot });
		emitDataForUdp(payload);

		const timeToWait = new Date();
		timeToWait.setSeconds(timeToWait.getSeconds() + 3);

		bot.programWait = timeToWait;

		return;
	}

	if (bot.assignedRoute && bot.routeTravel?.length) {
		const stepMeter = SPEED * INTERVAL;
		const pathLine: Feature<LineString> = lineStringTurf([...bot.routeTravel]);

		bot.event = REPLY_CURRENT_PASSIVE;
		bot.speed = (SPEED * 3.6).toFixed(2);

		const currentPoint = point([Number(bot.lon), Number(bot.lat)]);
		const distanceOfLine = pointToLineDistance(currentPoint, pathLine, {
			units: 'meters',
		});

		if (distanceOfLine > 25) {
			bot.routeTravel = [];
			bot.assignedRoute = 'false';
			return;
		}

		bot.distanceCurrentlyTraveled =
			(bot.distanceCurrentlyTraveled ?? 0) + stepMeter;

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

		const timeToWait = new Date();
		timeToWait.setSeconds(timeToWait.getSeconds() + INTERVAL);

		bot.programWait = timeToWait;
	}
};
