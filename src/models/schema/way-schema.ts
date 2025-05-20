import { BaseDocument } from '@models/interface/base-document';
import { model, PaginateModel, Schema } from 'mongoose';
import { baseSchema } from './base-schema';
import { baseSchemaOptions } from './base-schema-config';
import moongosePaginate from 'mongoose-paginate-v2';

export interface IWay extends BaseDocument {
	properties: {
		highway: string;
		name: string;
		surface: string;
	};
	geometry: {
		type: string;
		coordinates: [number, number][];
	};
	referenceId: string;
}

const WaySchema = new Schema<IWay>(
	{
		...baseSchema,
		properties: {
			highway: {
				type: String,
			},
			name: {
				type: String,
			},
			surface: {
				type: String,
			},
		},
		geometry: {
			type: {
				type: String,
				enum: ['LineString', 'Point', 'Polygon'],
				required: true,
			},
			coordinates: {
				type: [[Number]],
				required: true,
				validate: [
					(val: [number, number][]) => val.length >= 2,
					'LineString must have at least two points',
				],
			},
		},
		referenceId: {
			type: String,
		},
	},
	baseSchemaOptions
);

WaySchema.index({ geometry: '2dsphere' });
WaySchema.plugin(moongosePaginate);

export const Way = model<IWay, PaginateModel<IWay>>('Way', WaySchema, 'ways');
