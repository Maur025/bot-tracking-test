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

	public readonly findNearbyNodes = async (
		position: Position,
		maxDistance: number,
		minDistance: number = 0
	): Promise<IGraphWayIntersection[]> => {
		return this.serviceModel()
			.find({
				coord: {
					$near: {
						$geometry: {
							type: 'Point',
							coordinates: position,
						},
						$maxDistance: maxDistance,
						$minDistance: minDistance,
					},
				},
			})
			.populate('connections')
			.exec();
	};

	public readonly findNearby = async (
		position: Position,
		limit: number = 1
	): Promise<IGraphWayIntersection[]> => {
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
}

export const graphWayIntersectionService = new GraphWayIntersectionService();
