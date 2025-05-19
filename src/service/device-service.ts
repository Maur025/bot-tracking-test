import { Device, IDevice } from '@models/schema/device-schema';
import { BaseService } from './base-service';
import { Model } from 'mongoose';

class DeviceService extends BaseService<IDevice> {
	protected serviceModel(): Model<IDevice> {
		return Device;
	}

	public readonly findByImei = async (
		imei: string
	): Promise<IDevice | null> => {
		return this.serviceModel().findOne({ imei }).exec();
	};
}

export const deviceService = new DeviceService();
