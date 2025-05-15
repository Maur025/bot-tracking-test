import { BaseData } from '@maur025/core-model-data';
import { DeviceTrack } from './device-track';

export interface DeviceCurrentLocation extends BaseData {
	last: DeviceTrack;
}
