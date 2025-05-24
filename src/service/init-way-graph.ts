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
						await graphWayIntersectionService.findNearby({
							position: intersectionPointCoords,
							limit: 10,
						});

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
