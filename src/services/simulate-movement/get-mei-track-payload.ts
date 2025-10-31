import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackCheckSum } from '@utils/get-mei-track-check-sum-hex';
import { getMeiTrackDate } from '@utils/get-mei-track-date';
import { getMeiTrackPayloadLength } from '@utils/get-mei-track-payload-length';

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

	const latCut = Number(lat).toFixed(6);
	const lonCut = Number(lon).toFixed(6);

	const payloadBody: string = `${imei},${cmd},${event},${latCut},${lonCut},${bot.date},${stateGps},8,13,0,139,1.5,3397,898522,2241561,736|1|0064|2871,4200,0000|0000|0000|01A4|04EF,00000001`;

	return `$$G${getMeiTrackPayloadLength(
		payloadBody
	)},${payloadBody}*${getMeiTrackCheckSum(payloadBody)}`;
};
