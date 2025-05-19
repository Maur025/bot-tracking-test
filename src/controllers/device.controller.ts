import { MultiResponseBuilder } from '@maur025/core-model-data';
import { Request, Response } from 'express';
import { deviceService } from 'service/device-service';
import { StatusCodes } from 'http-status-codes';
import { IDevice } from '@models/schema/device-schema';

class DeviceController {
	public readonly getAllDevices = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const deviceList: IDevice[] = await deviceService.findAll();

		MultiResponseBuilder.builder()
			.res(res)
			.withResponse({
				code: StatusCodes.OK,
				message: 'SUCCESS',
				data: [...deviceList],
			})
			.send();
	};
}

export const deviceController = new DeviceController();
