import { wayService } from './database/way-service';
import { PaginateResult, Types } from 'mongoose';
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
import { lineIntersect, lineString } from '@turf/turf';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';

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

			const wayLineCoords: Position[] = way.geometry?.coordinates;
			const mainWayLine: Feature<LineString> = lineString(
				way.geometry?.coordinates
			);

			const possibleIntersectWays: IWay[] = await wayService.getLineIntersects(
				wayLineCoords
			);

			for (const intersectWay of possibleIntersectWays) {
				const intersectWayLine: Feature<LineString> = lineString(
					intersectWay.geometry?.coordinates
				);

				const intersectCollection: FeatureCollection<Point> = lineIntersect(
					mainWayLine,
					intersectWayLine
				);

				for (const intersectionPoint of intersectCollection.features) {
					const intersectionPointCoords: Position =
						intersectionPoint.geometry?.coordinates;

					const nodeId: string = getNodeId(intersectionPointCoords);

					let nodeData: IGraphWayIntersection | null =
						await graphWayIntersectionService.findByNodeId(nodeId);

					const nearbyNodes: IGraphWayIntersection[] =
						await graphWayIntersectionService.findNearby(
							intersectionPointCoords,
							10
						);

					const nearbyNodeIds: string[] = nearbyNodes
						.map(node => node.nodeId)
						.filter(id => id !== nodeId);

					if (!nodeData) {
						await graphWayIntersectionService.save({
							nodeId,
							coord: {
								type: 'Point',
								coordinates: [
									intersectionPointCoords[0],
									intersectionPointCoords[1],
								],
							},
							connections: nearbyNodeIds,
						});
					} else {
						await graphWayIntersectionService.update(nodeData._id, {
							connections: nearbyNodeIds,
						});
					}
				}
			}

			loggerDebug(`Register N° ${manualCount} of ${wayQuantity}`);
		}

		loggerDebug(`PAGE NUMBER: ${page}...`);

		hasMore = result.hasNextPage;
		page++;
	}
};

export const getNodeId = (point: Position): string => {
	const lon: string = point[0].toFixed(7);
	const lat: string = point[1].toFixed(7);

	return `${lon}/${lat}`;
};

// const startPoint: [number, number] = coords[0];
// const endPoint: [number, number] = coords[coords.length - 1];

// if (startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1]) {
// 	continue;
// }

// const startIntersectWays: IWay[] = await wayService.getWayNearbyByPoint({
// 	point: startPoint,
// 	distance: MAX_DISTANCE,
// });

// const endIntersectWays: IWay[] = await wayService.getWayNearbyByPoint({
// 	point: endPoint,
// 	distance: MAX_DISTANCE,
// });

// const startNodeId: string = getNodeId(startPoint);
// const endNodeId: string = getNodeId(endPoint);

// const startGraphFound = await graphWayIntersectionService.findByNodeId(
// 	startNodeId
// );

// const endGraphFound = await graphWayIntersectionService.findByNodeId(
// 	endNodeId
// );

// if (!startGraphFound) {
// 	await graphWayIntersectionService.save({
// 		nodeId: startNodeId,
// 		coord: {
// 			type: 'Point',
// 			coordinates: startPoint,
// 		},
// 		connections: startIntersectWays.map(intersect => intersect._id),
// 	});
// }

// if (!endGraphFound) {
// 	await graphWayIntersectionService.save({
// 		nodeId: endNodeId,
// 		coord: {
// 			type: 'Point',
// 			coordinates: endPoint,
// 		},
// 		connections: endIntersectWays.map(intersect => intersect._id),
// 	});
// }
