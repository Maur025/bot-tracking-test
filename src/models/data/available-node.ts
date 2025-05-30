import { Position } from 'geojson';

export interface AvailableNode {
	_id?: string;
	nodeId: string;
	coord: {
		type: 'Point';
		coordinates: Position;
	};
	connections: string[];
	costFromStart?: number;
	estimatedCostToGoal?: number;
	estimatedTotalCost?: number;
	parentNode?: Partial<AvailableNode> | null;
}
