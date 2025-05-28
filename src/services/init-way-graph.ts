import { wayService } from './database/way-service';
import { PaginateResult } from 'mongoose';
import { IWay } from '@models/schema/way-schema';
import { graphWayIntersectionService } from './database/graph-way-intersection-service';
import { loggerDebug, loggerInfo } from '@maur025/core-logger';
import {
	Feature,
	FeatureCollection,
	LineString,
	Point,
	Position,
} from 'geojson';
import {
	along,
	distance,
	length,
	lineIntersect,
	lineString,
	pointToLineDistance,
} from '@turf/turf';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import RBush from 'rbush';
import KDBush from 'kdbush';
import geokdbush from 'geokdbush';

export const initWayGraph = async () => {
	const graphWayIntersectionCount: number =
		await graphWayIntersectionService.count();

	if (graphWayIntersectionCount) {
		loggerInfo('[primary] graphs already created ... skiping');
		return;
	}

	const wayQuantity: number = await wayService.count();

	const limit: number = 1000;
	let page: number = 1;
	let hasMore: boolean = true;
	let manualCount: number = 0;

	const graphMap: Map<string, Partial<IGraphWayIntersection>> = new Map();
	const indexedMapData: KDBush = new KDBush(127251);

	console.time('carga de nodos al graphMap con un tiempo de: ');
	while (hasMore) {
		const result: PaginateResult<IWay> = await wayService.findAllPag(
			{},
			{ page, limit }
		);
		for (const way of result.docs) {
			manualCount++;

			if (
				way.geometry.type !== 'LineString' ||
				way.geometry.coordinates.length < 2
			) {
				continue;
			}

			for (const coord of way.geometry?.coordinates) {
				const nodeId: string = getNodeId(coord);

				if (graphMap.has(nodeId)) {
					continue;
				}

				graphMap.set(nodeId, {
					nodeId,
					coord: { type: 'Point', coordinates: coord },
				});

				indexedMapData.add(coord[0], coord[1]); // type Position of geojson
			}

			loggerDebug(`Register N° ${manualCount} of ${wayQuantity}`);
		}

		loggerDebug(`PAGE NUMBER: ${page}...`);

		hasMore = result.hasNextPage;
		page++;

		// CLEAN BEFORE NEXT CICLE
		result.docs.length = 0;
	}
	console.timeEnd('carga de nodos al graphMap con un tiempo de: ');
	indexedMapData.finish();

	loggerDebug(`graphMap size: ${graphMap.size}`);

	connectGraphMap(graphMap, indexedMapData);

	graphMap.clear();
};

const connectGraphMap = (
	graphMap: Map<string, Partial<IGraphWayIntersection>>,
	indexedGraphMap: KDBush
): void => {
	const graphMapAsList: Partial<IGraphWayIntersection>[] = Array.from(
		graphMap.values()
	);

	console.time('leendo lista de nodos');
	for (const nodo of graphMap.values()) {
		const nodoCoords = nodo.coord?.coordinates;

		if (!nodoCoords) continue;
	}
	console.timeEnd('leendo lista de nodos');
};

export const getNodeId = (point: Position): string => {
	const lon: string = point[0].toFixed(7);
	const lat: string = point[1].toFixed(7);

	return `${lon}/${lat}`;
};

// === fase 2 ====
/*

const indexNearbies = indexedGraphMap.within(
			nodoCoords[0],
			nodoCoords[1],
			200 / 111320 // 200 meters ... prefix to nodes
		);

let mainWayLine: Feature<LineString> | null = lineString(
				way.geometry?.coordinates
			);
			// console.time('for-loop intersect as way list');
			for (const intersectWay of possibleIntersectWays) {
				let intersectWayLine: Feature<LineString> | null = lineString(
					intersectWay.geometry?.coordinates
				);

				let intersectCollection: FeatureCollection<Point> | null =
					lineIntersect(mainWayLine, intersectWayLine);

				// console.time('for-loop real intersect list');
				for (const intersectionPoint of intersectCollection.features) {
					let intersectionPointCoords: Position | null =
						intersectionPoint.geometry?.coordinates;

					let nodeId: string | null = getNodeId(intersectionPointCoords);

					const nearbyNodes = spatialTree.search({
						minX: intersectionPointCoords[0] - searchNodeBuffer,
						minY: intersectionPointCoords[1] - searchNodeBuffer,
						maxX: intersectionPointCoords[0] + searchNodeBuffer,
						maxY: intersectionPointCoords[1] + searchNodeBuffer,
					}) as {
						nodeId: string;
						coord: { type: string; coordinates: Position };
					}[];

					const filterNearbyNodes = nearbyNodes
						.map(node => {
							if (!intersectionPointCoords || !node.coord?.coordinates) {
								return null;
							}
							const distanceBetweenNodes = distance(
								node.coord?.coordinates,
								intersectionPointCoords,
								{ units: 'meters' }
							);

							return { ...node, distance: distanceBetweenNodes };
						})
						.filter(node => node !== null)
						.sort((nodeA, nodeB) => nodeA?.distance - nodeB?.distance)
						.slice(0, 10);

					let nearbyNodeIds: string[] = [];

					// console.time('for-loop nearby nodes to current intersection');
					for (const nearNode of filterNearbyNodes) {
						if (nearNode.nodeId === nodeId) continue;

						let lineBetweenNodes: Feature<LineString> | null = lineString([
							intersectionPointCoords,
							nearNode.coord?.coordinates,
						]);

						let lineBetweenNodeLength: number | null = length(
							lineBetweenNodes,
							{
								units: 'meters',
							}
						);

						let centerOfLineBetweenNodes: Feature<Point> | null = along(
							lineBetweenNodes,
							lineBetweenNodeLength / 2,
							{ units: 'meters' }
						);

						// console.time(
						// 	'for-loop verify line by nodes to ways before founded'
						// );
						for (const wayToVerify of possibleIntersectWays) {
							if (!wayToVerify?.geometry?.coordinates) continue;

							let wayToVerifyLine: Feature<LineString> | null = lineString(
								wayToVerify.geometry?.coordinates
							);

							let distanceWithWay: number | null = pointToLineDistance(
								centerOfLineBetweenNodes,
								wayToVerifyLine,
								{ units: 'meters' }
							);

							if (distanceWithWay <= 5) {
								nearbyNodeIds.push(nearNode.nodeId);
								break;
							}

							// CLEAN BEFORE NEXT CICLE
							wayToVerifyLine = null;
							distanceWithWay = null;
						}
						// console.timeEnd(
						// 	'for-loop verify line by nodes to ways before founded'
						// );

						// CLEAN BEFORE NEXT CICLE
						lineBetweenNodes = null;
						lineBetweenNodeLength = null;
						centerOfLineBetweenNodes = null;
					}
					// console.timeEnd('for-loop nearby nodes to current intersection');

					let nodeOfGraph: Partial<IGraphWayIntersection> | undefined =
						graphMap.get(nodeId);

					if (!nodeOfGraph) {
						nodeOfGraph = {
							nodeId,
							coord: {
								type: 'Point',
								coordinates: [
									intersectionPointCoords[0],
									intersectionPointCoords[1],
								],
							},
							connections: nearbyNodeIds,
						};

						graphMap.set(nodeId, nodeOfGraph);

						spatialTree.insert({
							nodeId: nodeOfGraph.nodeId,
							coord: { ...nodeOfGraph.coord },
							minX: intersectionPointCoords[0],
							minY: intersectionPointCoords[1],
							maxX: intersectionPointCoords[0],
							maxY: intersectionPointCoords[1],
						});
					} else {
						graphMap.set(nodeId, {
							...nodeOfGraph,
							connections: nearbyNodeIds,
						});
					}

					// CLEAN BEFORE NEXT CICLE
					intersectionPointCoords = null;
					nodeId = null;
					nearbyNodes.length = 0;
					nearbyNodeIds.length = 0;
					nodeOfGraph = undefined;
					filterNearbyNodes.length = 0;
				}
				// console.timeEnd('for-loop real intersect list');

				// CLEAN BEFORE NEXT CICLE
				intersectWayLine = null;
				intersectCollection = null;
			}
			// console.timeEnd('for-loop intersect as way list');

			mainWayLine = null;
 */
