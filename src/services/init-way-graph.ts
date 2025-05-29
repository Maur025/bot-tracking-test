import { wayService } from './database/way-service';
import { PaginateResult } from 'mongoose';
import { IWay } from '@models/schema/way-schema';
import { graphWayIntersectionService } from './database/graph-way-intersection-service';
import { loggerDebug, loggerInfo } from '@maur025/core-logger';
import { Position } from 'geojson';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';

interface ConnectionWayCoords {
	wayCoords: Position[];
	location: 'start' | 'center' | 'end';
	nodeId: string;
	coords: Position;
	wayIndex: number;
}

export const initWayGraph = async () => {
	const graphWayIntersectionCount: number =
		await graphWayIntersectionService.count();

	if (graphWayIntersectionCount) {
		loggerInfo('[primary] graphs already created ... skiping');
		return;
	}

	const limit: number = 1000;
	let page: number = 1;
	let hasMore: boolean = true;

	const graphMap: Map<string, Partial<IGraphWayIntersection>> = new Map();
	const connectionWayCoordMap: Map<string, ConnectionWayCoords[]> = new Map();

	console.time('carga de nodos al graphMap con un tiempo de: ');
	while (hasMore) {
		const result: PaginateResult<IWay> = await wayService.findAllPag(
			{},
			{ page, limit }
		);

		for (const way of result.docs) {
			const wayCoords = way.geometry?.coordinates;

			if (way.geometry.type !== 'LineString' || wayCoords.length < 2) {
				continue;
			}

			for (let index = 0; index < wayCoords.length; index++) {
				const nodeId: string = getNodeId(wayCoords[index]);

				if (graphMap.has(nodeId)) {
					let type: 'start' | 'center' | 'end' = 'center';
					if (index === 0) {
						type = 'start';
					}

					if (index + 1 === wayCoords.length) {
						type = 'end';
					}

					let connectionData: ConnectionWayCoords[] | undefined =
						connectionWayCoordMap.get(nodeId);

					let connectionDataToAdd: ConnectionWayCoords | undefined = {
						wayCoords: wayCoords,
						location: type,
						coords: wayCoords[index],
						nodeId,
						wayIndex: index,
					};

					if (!connectionData) {
						connectionWayCoordMap.set(nodeId, [connectionDataToAdd]);
					} else {
						connectionWayCoordMap.set(nodeId, [
							...connectionData,
							connectionDataToAdd,
						]);
					}

					connectionData = undefined;
					connectionDataToAdd = undefined;

					continue;
				}

				let nodeConnections: string[] = [];

				if (index === 0) {
					nodeConnections.push(getNodeId(wayCoords[index + 1]));
				}

				if (index + 1 === wayCoords.length) {
					nodeConnections.push(getNodeId(wayCoords[wayCoords.length - 1]));
				}

				if (index > 0 && index + 1 < wayCoords.length) {
					nodeConnections.push(getNodeId(wayCoords[index + 1]));
					nodeConnections.push(getNodeId(wayCoords[index - 1]));
				}

				graphMap.set(nodeId, {
					nodeId,
					coord: { type: 'Point', coordinates: wayCoords[index] },
					connections: [...nodeConnections],
				});

				nodeConnections.length = 0;
			}
		}

		loggerDebug(`PAGE NUMBER: ${page}...`);

		hasMore = result.hasNextPage;
		page++;

		// CLEAN BEFORE NEXT CICLE
		result.docs.length = 0;
	}
	console.timeEnd('carga de nodos al graphMap con un tiempo de: ');

	reviewConnections(graphMap, connectionWayCoordMap);
	await saveToDataBase(graphMap);
	loggerDebug(`graphMap size: ${graphMap.size}`);
	loggerDebug(`cadidate to connect size: ${connectionWayCoordMap.size}`);

	graphMap.clear();
	connectionWayCoordMap.clear();
};

const reviewConnections = (
	graphMap: Map<string, Partial<IGraphWayIntersection>>,
	connectionWayCoords: Map<string, ConnectionWayCoords[]>
) => {
	console.time('reading candidate connection list');
	for (const connectionCandidate of connectionWayCoords) {
		const [keyOrId, candidateDataList] = connectionCandidate;

		const nodeToConnect = graphMap.get(keyOrId);

		if (!nodeToConnect) {
			continue;
		}

		for (const candidateData of candidateDataList) {
			let nodeToConnectId: string = '';
			let extraNodeToConnectId: string = '';

			if (candidateData.location === 'end') {
				nodeToConnectId = getNodeId(
					candidateData.wayCoords[candidateData.wayIndex - 1]
				);
			}

			if (candidateData.location === 'start') {
				nodeToConnectId = getNodeId(
					candidateData.wayCoords[candidateData.wayIndex + 1]
				);
			}

			if (candidateData.location === 'center') {
				nodeToConnectId = getNodeId(
					candidateData.wayCoords[candidateData.wayIndex + 1]
				);

				extraNodeToConnectId = getNodeId(
					candidateData.wayCoords[candidateData.wayIndex - 1]
				);
			}

			if (nodeToConnectId) {
				if (graphMap.has(nodeToConnectId)) {
					nodeToConnect.connections?.push(nodeToConnectId);
				}
			}

			if (extraNodeToConnectId) {
				if (graphMap.has(extraNodeToConnectId)) {
					nodeToConnect.connections?.push(extraNodeToConnectId);
				}
			}
		}
	}
	console.timeEnd('reading candidate connection list');
};

const saveToDataBase = async (
	graphMap: Map<string, Partial<IGraphWayIntersection>>
): Promise<void> => {
	const batchSize: number = 1000;
	let batch: Partial<IGraphWayIntersection>[] = [];

	console.time('saving data to database ');
	for (const graphData of graphMap.values()) {
		const connectionsSet: Set<string> = new Set(graphData.connections);

		batch.push({ ...graphData, connections: Array.from(connectionsSet) });

		if (batch.length === batchSize) {
			await graphWayIntersectionService.saveAll(batch);
			batch = [];
		}
	}

	if (batch.length) {
		await graphWayIntersectionService.saveAll(batch);
	}
	console.timeEnd('saving data to database ');
};

export const getNodeId = (point: Position): string => {
	const lon: string = point[0].toFixed(7);
	const lat: string = point[1].toFixed(7);

	return `${lon}/${lat}`;
};
