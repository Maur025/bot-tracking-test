import { BaseData } from '@maur025/core-model-data';
import { VehicleWay } from './vehicle-way';

export interface AllWays extends BaseData {
	vehicleWays: VehicleWay[];
}
