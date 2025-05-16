import { Device, IDevice } from '@models/schema/device-schema';
import { BaseService } from './base-service';
import { Model } from 'mongoose';

export class DeviceService extends BaseService<IDevice> {
	protected serviceModel(): Model<IDevice> {
		return Device;
	}
}
