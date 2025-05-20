import { IWay, Way } from '@models/schema/way-schema';
import { BaseService } from './base-service';
import { Model, Document } from 'mongoose';

class WayService extends BaseService<IWay> {
	protected serviceModel(): Model<IWay> {
		return Way;
	}

	public readonly getLineIntersects = async (
		startPoint: [number, number],
		endPoint: [number, number]
	): Promise<IWay[]> => {
		return this.serviceModel()
			.find({
				geometry: {
					$geoIntersects: {
						$geometry: {
							type: 'LineString',
							coordinates: [startPoint, endPoint],
						},
					},
				},
			})
			.exec();
	};

	public readonly getWayNearbyByPoint = async ({
		point,
		distance,
	}: {
		point: [number, number];
		distance: number;
	}): Promise<IWay[]> => {
		return this.serviceModel()
			.find({
				geometry: {
					$near: {
						$geometry: {
							type: 'Point',
							coordinates: point,
						},
						$maxDistance: distance,
					},
				},
			})
			.exec();
	};
}

export const wayService = new WayService();
