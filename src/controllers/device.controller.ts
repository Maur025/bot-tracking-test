import { MultiResponseBuilder } from '@maur025/core-model-data';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IDevice } from '@models/schema/device-schema';
import { PaginateResult } from 'mongoose';
import { deviceService } from '@services/database/device-service';

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

	public readonly getAllPaginated = async (
		req: Request,
		res: Response
	): Promise<void> => {
		const { page: qPage = '1', size: qLimit = '10' } = req.query;

		const deviceList: PaginateResult<IDevice> = await deviceService.findAllPag(
			{},
			{ page: Number(qPage), limit: Number(qLimit) }
		);

		MultiResponseBuilder.builder()
			.res(res)
			.withResponse({
				code: StatusCodes.OK,
				message: 'SUCCESS',
				data: [...deviceList.docs],
				paginate: {
					pages: deviceList.totalPages,
					count: deviceList.totalDocs,
					page: deviceList.page,
				},
			})
			.send();
	};
}

export const deviceController = new DeviceController();
