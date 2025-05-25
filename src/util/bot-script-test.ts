import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import { graphWayIntersectionService } from 'service/database/graph-way-intersection-service';
import { deviceEvents } from '@config/device-events';
import { loggerDebug, loggerError, loggerWarn } from '@maur025/core-logger';
import { getNodeId } from 'service/init-way-graph';
import {
	lineString as turfLineString,
	along as turfAlong,
	distance as turfDistance,
	length as turfLength,
} from '@turf/turf';
import { Feature, LineString, Point, Position } from 'geojson';

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

// const START_POINT: [number, number] = [-68.069209, -16.529014]; // [lon,lat]
// // const END_POINT: [number, number] = [-68.131162, -16.535328]; // [lon,lat]
// const END_POINT: [number, number] = [-68.078119, -16.53892]; // [lon,lat]

const avaibleNodes: Map<string, any> = new Map();

export const sendPositionTest = async (imei: string) => {
	// const path = await testGraphMovement();
	// console.log(path);
	// const firstCoord = path[0] ?? [0, 0];
	// // simulate ignition device
	// DEVICE_TEMPLATE.ignition = true;
	// const payloadInit = getPayload({
	// 	imei,
	// 	lat: firstCoord[1],
	// 	lon: firstCoord[0],
	// 	event: IGNITION_ON,
	// });
	// emitForUdp(payloadInit);
	// await setDelay(1000);
	// // simulate battery on device
	// DEVICE_TEMPLATE.bateryLevel = 80;
	// const payloadBatteryOn = getPayload({
	// 	imei,
	// 	lat: firstCoord[1],
	// 	lon: firstCoord[0],
	// 	event: EXTERNAL_BATTERY_ON,
	// });
	// emitForUdp(payloadBatteryOn);
	// await setDelay(2000);
	// // simulate sent data location
	// DEVICE_TEMPLATE.speed = '50.00';
	// await sendSimulatedCoordinates(path, imei);
	// ===================================00
	// for (const coord of path) {
	// 	const payload: string = getPayload({
	// 		imei,
	// 		lat: coord[1],
	// 		lon: coord[0],
	// 		event: REPLY_CURRENT_PASSIVE,
	// 	});
	// 	emitForUdp(payload);
	// 	await setDelay(1000);
	// }
	//== move later ==========
	// const lastCoord = path[path.length - 1];
	// // enter sleep
	// DEVICE_TEMPLATE.speed = '0.00';
	// const payloadNewSleep = getPayload({
	// 	imei,
	// 	lat: lastCoord[1],
	// 	lon: lastCoord[0],
	// 	event: ENTER_SLEEP,
	// });
	// emitForUdp(payloadNewSleep);
	// await setDelay(5000);
	// // ingnition off
	// DEVICE_TEMPLATE.ignition = false;
	// const payloadOff = getPayload({
	// 	imei,
	// 	lat: lastCoord[1],
	// 	lon: lastCoord[0],
	// 	event: IGNITION_OFF,
	// });
	// emitForUdp(payloadOff);
	// loggerDebug('path finished ... waiting other operations');
};

// const sendSimulatedCoordinates = async (
// 	path: [number, number][],
// 	imei: string
// ): Promise<void> => {

// };

export const testGraphMovement = async (
	startPoint: Position,
	endPoint: Position
): Promise<[number, number][]> => {
	const totalDistance: number = turfDistance(startPoint, endPoint, {
		units: 'meters',
	});

	const startNodesList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearby({
			position: startPoint,
		});

	const endNodeList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearby({
			position: endPoint,
		});

	const intermediateNodeList: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbiesByDistance({
			position: startPoint,
			maxDistance: Math.floor(totalDistance) * 1.25,
		});

	const startNode = startNodesList[0].toObject();
	const endNode = endNodeList[0].toObject();

	avaibleNodes.set(startNode?.nodeId, startNode);
	avaibleNodes.set(endNode?.nodeId, endNode);

	for (const node of intermediateNodeList) {
		if (avaibleNodes.has(node.nodeId)) {
			continue;
		}

		avaibleNodes.set(node.nodeId, node.toObject());
	}

	// const currentPoint = await aStar(
	// 	{ ...startNode },
	// 	{
	// 		...endNode,
	// 	}
	// );

	return []; //buildPath(currentPoint) ??
};

// const aStar = async (start: any, goal: any): Promise<any> => {
// 	// f(n) = g(n) + h(n)
// 	let openList = [start];
// 	const closedList: Set<string> = new Set<string>();

// 	start.g = 0;
// 	start.h = heuristic(start, goal);
// 	start.f = start.g + start.h;
// 	start.parent = null;
// 	start.fromWay = null;

// 	// console.log(start);
// 	// console.log(avaibleNodes);

// 	while (openList.length > 0) {
// 		// order points/nodes for f value
// 		openList.sort((pointA, pointB) => pointA.f - pointB.f);

// 		// get first element and remove of open list
// 		const currentPoint = openList.shift();

// 		// point not exist must be break process
// 		if (!currentPoint) {
// 			break;
// 		}

// 		// console.log('CURRENT POINT NODE ID', currentPoint.nodeId);
// 		// console.log('GOAL NODE ID', goal.nodeId);
// 		// console.log(' ');

// 		// goal reached if node ids match
// 		if (currentPoint.nodeId === goal.nodeId) {
// 			loggerDebug('Goal reached GOOD');
// 			console.log('Se llego a la meta');

// 			return currentPoint;
// 		}

// 		// add node to closedList = already review
// 		closedList.add(currentPoint.nodeId);

// 		// console.log('current nodeId', currentPoint.nodeId);

// 		// iterate of current connections
// 		for (const way of currentPoint.connections) {
// 			const coords = way.geometry?.coordinates;
// 			const startNodeId = getNodeId(coords[0]);
// 			const endNodeId = getNodeId(coords[coords.length - 1]);

// 			for (const neighborId of [startNodeId, endNodeId]) {
// 				if (neighborId === currentPoint.nodeId) {
// 					continue;
// 				}

// 				if (closedList.has(neighborId)) {
// 					continue;
// 				}

// 				const neighbor = avaibleNodes.get(neighborId);

// 				if (!neighbor) {
// 					continue;
// 				}

// 				const tentativeG = currentPoint.g + heuristic(currentPoint, neighbor);
// 				// console.log(tentativeG);

// 				if (neighbor.g === undefined || tentativeG < neighbor.g) {
// 					neighbor.g = tentativeG;
// 					neighbor.h = heuristic(neighbor, goal);
// 					neighbor.f = neighbor.g + neighbor.h;
// 					neighbor.parent = currentPoint;
// 					neighbor.fromWay = way;

// 					if (!openList.find(point => point.nodeId === neighbor.nodeId)) {
// 						openList.push(neighbor);
// 						// console.log('entro a agregar en la lista');
// 					}
// 				}
// 			}
// 		}
// 	}

// 	console.log('NO SE ENCONTRO UN CAMINO');
// 	return null;
// };

const buildPath = (node: any): any[] => {
	let currentNode = node;

	let path: [number, number][] = [];

	while (currentNode) {
		let coordsToUse = [];

		const nodeCoords = currentNode.coord.coordinates;
		const coords = currentNode?.fromWay?.geometry?.coordinates;

		if (coords) {
			const startDistance = turfDistance(nodeCoords, coords[0], {
				units: 'meters',
			});
			const endDistance = turfDistance(nodeCoords, coords[coords.length - 1], {
				units: 'meters',
			});

			if (startDistance < endDistance) {
				coordsToUse = [...coords];
			} else {
				coordsToUse = [...coords].reverse();
			}
		} else {
			coordsToUse = [nodeCoords];
		}

		const interpolateCoords: [number, number][] = avoidDuplicates(
			coordsToUse,
			path
		);

		path = [...path, ...interpolateCoords];

		currentNode = currentNode.parent;
	}

	return [...path].reverse();
};

const avoidDuplicates = (
	checkCoordList: [number, number][],
	fullPath: [number, number][]
): [number, number][] => {
	if (!fullPath.length) {
		return [...checkCoordList];
	}

	const [lastPathLon = 0, lastPathLat = 0] = fullPath[fullPath.length - 1];
	const [checkLon = 0, checkLat = 0] = checkCoordList[0];

	if (lastPathLat === checkLat && lastPathLon === checkLon) {
		const updateableList = [...checkCoordList];
		updateableList.shift();

		return updateableList;
	}

	return [...checkCoordList];
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
