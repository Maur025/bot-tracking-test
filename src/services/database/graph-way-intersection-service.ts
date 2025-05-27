import {
	graphWayIntersection,
	IGraphWayIntersection,
} from '@models/schema/graph-way-intersection';
import { BaseService } from './base-service';
import { Model } from 'mongoose';
import { Position } from 'geojson';

class GraphWayIntersectionService extends BaseService<IGraphWayIntersection> {
	protected serviceModel(): Model<IGraphWayIntersection> {
		return graphWayIntersection;
	}

	public readonly findByNodeId = async (
		nodeId: string
	): Promise<IGraphWayIntersection | null> => {
		return this.serviceModel()
			.findOne({
				nodeId,
			})
			.exec();
	};

	// review use
	// public readonly findNearbyNodes = async (
	// 	position: Position,
	// 	maxDistance: number,
	// 	minDistance: number = 0
	// ): Promise<IGraphWayIntersection[]> => {
	// 	return this.serviceModel()
	// 		.find({
	// 			coord: {
	// 				$near: {
	// 					$geometry: {
	// 						type: 'Point',
	// 						coordinates: position,
	// 					},
	// 					$maxDistance: maxDistance,
	// 					$minDistance: minDistance,
	// 				},
	// 			},
	// 		})
	// 		.populate('connections')
	// 		.exec();
	// };

	public readonly findNearby = async ({
		position,
		limit = 1,
	}: {
		position: Position;
		limit?: number;
	}): Promise<IGraphWayIntersection[]> => {
		return this.serviceModel()
			.find({
				coord: {
					$near: {
						$geometry: {
							type: 'Point',
							coordinates: position,
						},
					},
				},
			})
			.limit(limit)
			.exec();
	};

	public readonly findNearbiesByDistance = ({
		position,
		maxDistance,
		limit = 0,
	}: {
		position: Position;
		maxDistance: number;
		limit?: number;
	}): Promise<IGraphWayIntersection[]> => {
		let pipeline: any[] = [
			{
				$geoNear: {
					near: { type: 'Point', coordinates: [position[0], position[1]] },
					distanceField: 'distance',
					spherical: true,
					maxDistance,
				},
			},
		];

		if (limit > 0) {
			pipeline = [
				...pipeline,
				{
					$limit: limit,
				},
			];
		}

		return this.serviceModel().aggregate(pipeline);
	};
}

export const graphWayIntersectionService = new GraphWayIntersectionService();
