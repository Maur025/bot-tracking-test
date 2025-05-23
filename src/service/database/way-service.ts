import { IWay, Way } from '@models/schema/way-schema';
import { BaseService } from './base-service';
import { Model } from 'mongoose';
import { Position } from 'geojson';

class WayService extends BaseService<IWay> {
	protected serviceModel(): Model<IWay> {
		return Way;
	}

	public readonly getLineIntersects = async (
		wayLine: Position[]
	): Promise<IWay[]> => {
		return this.serviceModel()
			.find({
				geometry: {
					$geoIntersects: {
						$geometry: {
							type: 'LineString',
							coordinates: wayLine,
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

	public readonly findNearby = async (
		position: [number, number]
	): Promise<IWay[]> => {
		return this.serviceModel()
			.aggregate([
				{
					$geoNear: {
						near: {
							type: 'Point',
							coordinates: position,
						},
						distanceField: 'distance',
						spherical: true,
					},
				},
				{ $limit: 1 },
			])
			.exec();
	};
}

export const wayService = new WayService();
