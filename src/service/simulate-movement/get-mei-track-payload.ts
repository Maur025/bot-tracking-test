import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackCheckSum } from 'util/get-mei-track-check-sum-hex';
import { getMeiTrackDate } from 'util/get-mei-track-date';
import { getMeiTrackPayloadLength } from 'util/get-mei-track-payload-length';

interface Request {
	bot: DeviceBotCache;
}

export const getMeiTrackPayload = ({ bot }: Request): string => {
	const {
		imei,
		cmd,
		event,
		lat,
		lon,
		stateGps,
		usedSatellites,
		acc,
		speed,
		odometer,
		bateryLevel,
		ignition,
		analog,
		einfo,
		custom,
	}: Partial<DeviceBotCache> = bot;

	bot.date = getMeiTrackDate();

	const payloadBody: string = `${imei},${cmd},${event},${lat},${lon},${bot.date},${stateGps},${usedSatellites},${acc},${speed},0,0,0,0,${odometer},${bateryLevel},${ignition},${analog},${einfo},${custom}`;

	return `$$${getMeiTrackPayloadLength(
		payloadBody
	)},${payloadBody}*${getMeiTrackCheckSum(payloadBody)}`;
};
