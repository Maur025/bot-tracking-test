import env from '@config/env';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import dgram from 'node:dgram';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { graphWayIntersectionService } from 'service/database/graph-way-intersection-service';
import { getDistance } from 'ol/sphere';
import { deviceEvents } from '@config/device-events';
import { loggerDebug, loggerError } from '@maur025/core-logger';
import { getNodeId } from 'service/init-way-graph';

const { UDP_HOST, UDP_PORT } = env;
const {
	SOS_PRESSED,
	LOW_BATTERY,
	LOW_EXTERNAL,
	SPEEDING,
	EXTERNAL_BATTERY_ON,
	EXTERNAL_BATTERY_CUT,
	GPS_SIGNAL_LOST,
	GPS_SIGNAL_RECOVERY,
	ENTER_SLEEP,
	EXIT_SLEEP,
	REPLY_CURRENT_PASSIVE,
	IGNITION_ON,
	IGNITION_OFF,
} = deviceEvents;

const udpClient = dgram.createSocket('udp4');

const START_POINT: [number, number] = [-68.069209, -16.529014]; // [lon,lat]
// const END_POINT: [number, number] = [-68.131162, -16.535328]; // [lon,lat]
const END_POINT: [number, number] = [-68.078119, -16.53892]; // [lon,lat]

const avaibleNodes: Map<string, any> = new Map();

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

const DEVICE_TEMPLATE: {
	cmd: 'GPRMC' | 'AAA';
	stateGps: 'A';
	usedSatellites: number;
	acc: number;
	speed: string; // -> format 00.00
	odometer: number; // -> quantity km traveled
	bateryLevel: number; // -> percentage or mv
	ignition: boolean; // boolean to clarity -> convert in 0 or 1
	analog: number;
	einfo: number;
	custom: number;
} = {
	// imei
	cmd: 'AAA',
	// event
	// coords
	// date
	stateGps: 'A',
	usedSatellites: 0,
	acc: 10,
	speed: '0.00',
	odometer: 3600,
	bateryLevel: 0,
	ignition: false,
	analog: 0,
	einfo: 0,
	custom: 0,
};

const getPayload = ({
	imei,
	lat,
	lon,
	event,
}: {
	imei: string;
	lat: number;
	lon: number;
	event: string;
}): string => {
	const {
		cmd,
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
	} = DEVICE_TEMPLATE;

	const payloadBody: string = `${imei},${cmd},${event},${lat},${lon},${getTimestamp()},${stateGps},${usedSatellites},${acc},${speed},0,0,0,0,${odometer},${bateryLevel},${
		ignition ? '1' : '0'
	},${analog},${einfo},${custom}`;

	return `$$${getPayloadLength(payloadBody)},${payloadBody}*${getChecksumHex(
		payloadBody
	)}`;
};

export const sendPositionTest = async (imei: string) => {
	const path = await testGraphMovement();
	console.log(path);

	const firstCoord = path[0] ?? [0, 0];

	// simulate ignition device
	DEVICE_TEMPLATE.ignition = true;

	const payloadInit = getPayload({
		imei,
		lat: firstCoord[1],
		lon: firstCoord[0],
		event: IGNITION_ON,
	});

	emitForUdp(payloadInit);
	await setDelay(1000);

	// simulate battery on device
	DEVICE_TEMPLATE.bateryLevel = 80;
	const payloadBatteryOn = getPayload({
		imei,
		lat: firstCoord[1],
		lon: firstCoord[0],
		event: EXTERNAL_BATTERY_ON,
	});
	emitForUdp(payloadBatteryOn);
	await setDelay(2000);

	// simulate sent data location
	DEVICE_TEMPLATE.speed = '50.00';

	for (const coord of path) {
		const payload: string = getPayload({
			imei,
			lat: coord[1],
			lon: coord[0],
			event: REPLY_CURRENT_PASSIVE,
		});

		emitForUdp(payload);

		await setDelay(1000);
	}

	const lastCoord = path[path.length - 1];

	// enter sleep
	DEVICE_TEMPLATE.speed = '0.00';
	const payloadNewSleep = getPayload({
		imei,
		lat: lastCoord[1],
		lon: lastCoord[0],
		event: ENTER_SLEEP,
	});
	emitForUdp(payloadNewSleep);
	await setDelay(5000);

	// ingnition off
	DEVICE_TEMPLATE.ignition = false;
	const payloadOff = getPayload({
		imei,
		lat: lastCoord[1],
		lon: lastCoord[0],
		event: IGNITION_OFF,
	});

	emitForUdp(payloadOff);
};

const testGraphMovement = async (): Promise<[number, number][]> => {
	const totalDistance: number = getDistance(START_POINT, END_POINT);

	const startNodesList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbyNodes(START_POINT, 10);

	const endNodeList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbyNodes(END_POINT, 10);

	const intermediateNodeList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbyNodes(
			START_POINT,
			Math.floor(totalDistance) * 2
		);

	let startNode = null;
	let startDistance = 999999999;
	for (const node of startNodesList) {
		const distance = getDistance(node.coord.coordinates, START_POINT);

		if (distance < startDistance) {
			startDistance = distance;
			startNode = node.toObject();
		}
	}

	let endNode = null;
	let endDistance = 999999999;
	for (const node of endNodeList) {
		const distance = getDistance(node.coord?.coordinates, END_POINT);

		if (distance < endDistance) {
			endDistance = distance;
			endNode = node.toObject();
		}
	}

	avaibleNodes.set(startNode?.nodeId, startNode);
	avaibleNodes.set(endNode?.nodeId, endNode);

	for (const node of intermediateNodeList) {
		if (avaibleNodes.has(node.nodeId)) {
			continue;
		}

		avaibleNodes.set(node.nodeId, node.toObject());
	}

	const currentPoint = await aStar(
		{ ...startNode },
		{
			...endNode,
		}
	);

	return buildPath(currentPoint) ?? [];
};

const aStar = async (start: any, goal: any): Promise<any> => {
	// f(n) = g(n) + h(n)
	let openList = [start];
	const closedList: Set<string> = new Set<string>();

	start.g = 0;
	start.h = heuristic(start, goal);
	start.f = start.g + start.h;
	start.parent = null;
	start.fromWay = null;

	// console.log(start);
	// console.log(avaibleNodes);

	while (openList.length > 0) {
		// order points/nodes for f value
		openList.sort((pointA, pointB) => pointA.f - pointB.f);

		// get first element and remove of open list
		const currentPoint = openList.shift();

		// point not exist must be break process
		if (!currentPoint) {
			break;
		}

		// console.log('CURRENT POINT NODE ID', currentPoint.nodeId);
		// console.log('GOAL NODE ID', goal.nodeId);
		// console.log(' ');

		// goal reached if node ids match
		if (currentPoint.nodeId === goal.nodeId) {
			loggerDebug('Goal reached GOOD');
			console.log('Se llego a la meta');

			return currentPoint;
		}

		// add node to closedList = already review
		closedList.add(currentPoint.nodeId);

		// console.log('current nodeId', currentPoint.nodeId);

		// iterate of current connections
		for (const way of currentPoint.connections) {
			const coords = way.geometry?.coordinates;
			const startNodeId = getNodeId(coords[0]);
			const endNodeId = getNodeId(coords[coords.length - 1]);

			for (const neighborId of [startNodeId, endNodeId]) {
				if (neighborId === currentPoint.nodeId) {
					continue;
				}

				if (closedList.has(neighborId)) {
					continue;
				}

				const neighbor = avaibleNodes.get(neighborId);

				if (!neighbor) {
					continue;
				}

				const tentativeG = currentPoint.g + heuristic(currentPoint, neighbor);
				// console.log(tentativeG);

				if (neighbor.g === undefined || tentativeG < neighbor.g) {
					neighbor.g = tentativeG;
					neighbor.h = heuristic(neighbor, goal);
					neighbor.f = neighbor.g + neighbor.h;
					neighbor.parent = currentPoint;
					neighbor.fromWay = way;

					if (!openList.find(point => point.nodeId === neighbor.nodeId)) {
						openList.push(neighbor);
						// console.log('entro a agregar en la lista');
					}
				}
			}
		}
	}

	console.log('NO SE ENCONTRO UN CAMINO');
	return null;
};

const heuristic = (pointA: any, pointB: any): number => {
	const {
		coord: { coordinates: coordStart },
	} = pointA;
	const {
		coord: { coordinates: coordGoal },
	} = pointB;

	return getDistance(coordStart, coordGoal);
};

const buildPath = (node: any): any[] => {
	let currentNode = node;

	let path: [number, number][] = [];

	while (currentNode) {
		let coordsToUse = [];

		const nodeCoords = currentNode.coord.coordinates;
		const coords = currentNode?.fromWay?.geometry?.coordinates;

		if (coords) {
			const startDistance = getDistance(nodeCoords, coords[0]);
			const endDistance = getDistance(nodeCoords, coords[coords.length - 1]);

			if (startDistance < endDistance) {
				coordsToUse = [...coords];
			} else {
				coordsToUse = [...coords].reverse();
			}
		} else {
			coordsToUse = [nodeCoords];
		}

		for (const coord of coordsToUse) {
			const lastCoord = path[path.length - 1];

			if (
				!lastCoord ||
				lastCoord[0] !== coord[0] ||
				lastCoord[1] !== coord[1]
			) {
				path.push(coord);
			}
		}

		currentNode = currentNode.parent;
	}

	return [...path].reverse();
};

const heuristicDistanceEuclidiana = (start: any, goal: any): number => {
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
			loggerError('Error sending message: ', error);
		} else {
			loggerDebug(`GPS data send: ${message.toString()}`);
		}
	});
};

const setDelay = (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms));
