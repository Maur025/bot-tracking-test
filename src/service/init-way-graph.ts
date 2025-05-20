import { wayService } from './database/way-service';
import { PaginateResult, Types } from 'mongoose';
import { IWay } from '@models/schema/way-schema';
import { graphWayIntersectionService } from './database/graph-way-intersection-service';
import { loggerInfo } from '@maur025/core-logger';

const MAX_DISTANCE: number = 1; //meters

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

	while (hasMore) {
		const result: PaginateResult<IWay> = await wayService.findAllPag(
			{},
			{ page, limit }
		);

		for (const way of result.docs) {
			if (
				way.geometry.type !== 'LineString' ||
				way.geometry.coordinates.length < 2
			) {
				continue;
			}

			const coords: [number, number][] = way.geometry?.coordinates;
			const startPoint: [number, number] = coords[0];
			const endPoint: [number, number] = coords[coords.length - 1];

			if (startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1]) {
				continue;
			}

			const startIntersectWays: IWay[] = await wayService.getWayNearbyByPoint({
				point: startPoint,
				distance: MAX_DISTANCE,
			});

			const endIntersectWays: IWay[] = await wayService.getWayNearbyByPoint({
				point: endPoint,
				distance: MAX_DISTANCE,
			});

			const startNodeId: string = getNodeId(startPoint);
			const endNodeId: string = getNodeId(endPoint);

			const startGraphFound = await graphWayIntersectionService.findByNodeId(
				startNodeId
			);

			const endGraphFound = await graphWayIntersectionService.findByNodeId(
				endNodeId
			);

			if (!startGraphFound) {
				await graphWayIntersectionService.save({
					nodeId: startNodeId,
					coord: {
						type: 'Point',
						coordinates: startPoint,
					},
					connections: startIntersectWays.map(intersect => intersect._id),
				});
			}

			if (!endGraphFound) {
				await graphWayIntersectionService.save({
					nodeId: endNodeId,
					coord: {
						type: 'Point',
						coordinates: endPoint,
					},
					connections: endIntersectWays.map(intersect => intersect._id),
				});
			}
		}

		console.log(`${page}...`);

		hasMore = result.hasNextPage;
		page++;
	}
};

const getNodeId = (point: [number, number]): string => {
	const lon: string = point[0].toFixed(7);
	const lat: string = point[1].toFixed(7);

	return `${lon}/${lat}`;
};
