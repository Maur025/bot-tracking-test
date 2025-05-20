import {
	graphWayIntersection,
	IGraphWayIntersection,
} from '@models/schema/graph-way-intersection';
import { BaseService } from './base-service';
import { Model } from 'mongoose';

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
}

export const graphWayIntersectionService = new GraphWayIntersectionService();
