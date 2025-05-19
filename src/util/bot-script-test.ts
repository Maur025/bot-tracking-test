import env from '@config/env';
import dgram from 'node:dgram';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBotRoute } from 'service/get-bot-route';

const { UDP_HOST, UDP_PORT } = env;

const udpClient = dgram.createSocket('udp4');

const botRoute: [number, number][] = getBotRoute();
const cmd: 'GPRMC' | 'AAA' = 'AAA';

const getTimestamp = () => {
	const date = new Date();

	const year = String(date.getUTCFullYear()).slice(2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getUTCHours()).padStart(2, '0');
	const minutes = String(date.getUTCMinutes()).padStart(2, '0');
	const seconds = String(date.getUTCSeconds()).padStart(2, '0');
	const miliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

	return `${year}${month}${day}${hours}${minutes}${seconds}${miliseconds}`;
};

const getPayloadLength = (payload: string): string => {
	return payload.length?.toString();
};

const getChecksumHex = (payload: string): string => {
	let checksum: number = 0;

	for (let i = 0; i < payload.length; i++) {
		checksum ^= payload.charCodeAt(i);
	}

	return checksum.toString(16).toUpperCase().padStart(2, '0');
};

export const sendPositionBot = ({
	imei,
	deviceId,
}: {
	imei: string;
	deviceId: string;
}): //index: number
void => {
	// const coords = botRoute[index];
	// $$<length><command>,<imei>,<command>,<event>,<lat>,<lon>,<timestamp>,A,...*<checksum>
	// const payload: string = `${imei},${cmd},22,${coords[0]},${
	// 	coords[1]
	// },${getTimestamp()},A,0,10,40.00,0,0,0,0,3600,100,1,0,0,0`;
	// const gpsMeiData: string = `$$${getPayloadLength(
	// 	payload
	// )},${payload}*${getChecksumHex(payload)}`;
	// const message = Buffer.from(gpsMeiData, 'ascii');
	// udpClient.send(message, UDP_PORT, UDP_HOST, error => {
	// 	if (error) {
	// 		console.error('Error sending message:', error);
	// 	} else {
	// 		console.log(`GPS data send: ${message}`);
	// 	}
	// });
};

export const sendPositionTest = (imei: string) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const allWays: { vehicleWays: any[] } = JSON.parse(
		readFileSync(join(__dirname, '../config/only-vehicle-ways.json'), 'utf8')
	);

	for (const way of allWays.vehicleWays) {
		for (const coord of way.geometry?.coordinates) {
			const payload: string = `${imei},${cmd},22,${coord[0]},${
				coord[1]
			},${getTimestamp()},A,0,10,40.00,0,0,0,0,3600,100,1,0,0,0`;

			const gpsMeiData: string = `$$${getPayloadLength(
				payload
			)},${payload}*${getChecksumHex(payload)}`;

			const message = Buffer.from(gpsMeiData, 'ascii');

			console.log(gpsMeiData);
		}
	}
};
