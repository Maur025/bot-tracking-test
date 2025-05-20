import { BaseData } from '@maur025/core-model-data';

export interface VehicleWay extends BaseData {
	type: string;
	properties: {
		'@id'?: string;
		highway?: string;
		name: string;
		surface?: string;
	};
	geometry: {
		type: string;
		coordinates: [number, number][];
	};
	startConnections: string[];
	endConnections: string[];
}
