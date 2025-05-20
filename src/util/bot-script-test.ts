import env from '@config/env';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import dgram from 'node:dgram';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { graphWayIntersectionService } from 'service/database/graph-way-intersection-service';
import { getDistance } from 'ol/sphere';

const { UDP_HOST, UDP_PORT } = env;

const udpClient = dgram.createSocket('udp4');
const cmd: 'GPRMC' | 'AAA' = 'AAA';

const START_POINT: [number, number] = [-68.069209, -16.529014]; // [lon,lat]
const END_POINT: [number, number] = [-68.131162, -16.535328]; // [lon,lat]

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

export const sendPositionTest = async (imei: string) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	await testGraphMovement();

	const allWays: { vehicleWays: any[] } = JSON.parse(
		readFileSync(join(__dirname, '../config/only-vehicle-ways.json'), 'utf8')
	);

	for (const way of allWays.vehicleWays) {
		for (const coord of way.geometry?.coordinates ?? []) {
			const payload: string = `${imei},${cmd},22,${coord[1]},${
				coord[0]
			},${getTimestamp()},A,0,10,40.00,0,0,0,0,3600,100,1,0,0,0`;

			const gpsMeiData: string = `$$${getPayloadLength(
				payload
			)},${payload}*${getChecksumHex(payload)}`;

			emitForUdp(gpsMeiData);

			await setDelay(1000);
		}
	}
};

const testGraphMovement = async () => {
	const totalDistance: number = getDistance(START_POINT, END_POINT);

	// console.log('TOTAL DISTANCE: ', totalDistance);

	const startNodesList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbyNodes(START_POINT, 10);

	// console.log('START NODES FOUNDED: ', startNodesList);

	const endNodeList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbyNodes(END_POINT, 10);

	// console.log('END NODES FOUNDED: ', endNodeList);

	const intermediateNodeList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbyNodes(
			START_POINT,
			totalDistance
		);

	await aStar({ ...startNodesList[0].toObject() }, intermediateNodeList, {
		...endNodeList[0].toObject(),
	});

	// console.log('INTERMEDIATE NODES FOUNDED: ', intermediateNodeList);
};

const aStar = async (start: any, intermediate: any[], goal: any) => {
	// f(n) = g(n) + h(n)
	let openList = [start, ...intermediate];
	let closedList = [];

	start.g = 0;
	start.h = heuristic(start, goal);
	start.f = start.g + start.h;
	start.parent = null;

	console.log(start);
};

const heuristic = (start: any, goal: any): number => {
	const { coord: coordStart } = start;
	const x1 = coordStart.coordinates[0]; // lon
	const x2 = coordStart.coordinates[1]; // lat

	const { coord: coordGoal } = goal;
	const y1 = coordGoal.coordinates[0]; // lon
	const y2 = coordGoal.coordinates[1]; // lat

	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

const emitForUdp = (dataToSend: string) => {
	const message = Buffer.from(dataToSend, 'ascii');

	udpClient.send(message, UDP_PORT, UDP_HOST, error => {
		if (error) {
			console.error('Error sending message:', error);
		} else {
			console.log(`GPS data send: ${message.toString()}`);
		}
	});
};

const setDelay = (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms));
