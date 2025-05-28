import { wayService } from './database/way-service';
import { PaginateResult } from 'mongoose';
import { IWay } from '@models/schema/way-schema';
import { graphWayIntersectionService } from './database/graph-way-intersection-service';
import { loggerDebug, loggerInfo } from '@maur025/core-logger';
import {
	Feature,
	FeatureCollection,
	LineString,
	MultiPolygon,
	Point,
	Polygon,
	Position,
} from 'geojson';
import { booleanWithin, buffer, lineIntersect, lineString } from '@turf/turf';
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
			let mainWayLine: Feature<LineString> | null = lineString(
				way.geometry?.coordinates
			);

			const possibleIntersectWays: IWay[] = await wayService.getLineIntersects(
				wayLineCoords
			);

			for (const intersectWay of possibleIntersectWays) {
				let intersectWayLine: Feature<LineString> | null = lineString(
					intersectWay.geometry?.coordinates
				);

				let intersectCollection: FeatureCollection<Point> | null =
					lineIntersect(mainWayLine, intersectWayLine);

				for (const intersectionPoint of intersectCollection.features) {
					let intersectionPointCoords: Position | null =
						intersectionPoint.geometry?.coordinates;

					let nodeId: string | null = getNodeId(intersectionPointCoords);

					let nodeData: IGraphWayIntersection | null =
						await graphWayIntersectionService.findByNodeId(nodeId);

					let nearbyNodes: IGraphWayIntersection[] =
						await graphWayIntersectionService.findNearby({
							position: intersectionPointCoords,
							limit: 10,
						});

					let nearbyNodeIds: string[] = [];

					for (const nearNode of nearbyNodes) {
						if (nearNode.nodeId === nodeId) continue;

						let lineBetweenNodes: Feature<LineString> | null = lineString([
							intersectionPointCoords,
							nearNode.coord?.coordinates,
						]);

						for (const wayToVerify of possibleIntersectWays) {
							if (!wayToVerify?.geometry?.coordinates) continue;

							let wayToVerifyLine: Feature<LineString> | null = lineString(
								wayToVerify.geometry?.coordinates
							);

							let wayBuffer = buffer(wayToVerifyLine, 10, { units: 'meters' });

							if (!wayBuffer) continue;

							let isInside = booleanWithin(lineBetweenNodes, wayBuffer);

							if (isInside) {
								nearbyNodeIds.push(nearNode.nodeId);
								break;
							}

							// CLEAN BEFORE NEXT CICLE
							wayToVerifyLine = null;
							wayBuffer = undefined;
						}

						// CLEAN BEFORE NEXT CICLE
						lineBetweenNodes = null;
					}

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

					// CLEAN BEFORE NEXT CICLE
					intersectionPointCoords = null;
					nodeId = null;
					nodeData = null;
					nearbyNodes.length = 0;
					nearbyNodeIds.length = 0;
				}

				// CLEAN BEFORE NEXT CICLE
				intersectWayLine = null;
				intersectCollection = null;
			}

			loggerDebug(`Register N° ${manualCount} of ${wayQuantity}`);

			// CLEAN BEFORE NEXT CICLE
			wayLineCoords.length = 0;
			mainWayLine = null;
			possibleIntersectWays.length = 0;
		}

		loggerDebug(`PAGE NUMBER: ${page}...`);

		hasMore = result.hasNextPage;
		page++;

		// CLEAN BEFORE NEXT CICLE
		result.docs.length = 0;
	}
};

export const getNodeId = (point: Position): string => {
	const lon: string = point[0].toFixed(7);
	const lat: string = point[1].toFixed(7);

	return `${lon}/${lat}`;
};
