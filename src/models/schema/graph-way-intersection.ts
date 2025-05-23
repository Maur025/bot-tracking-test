import { BaseDocument } from '@models/interface/base-document';
import { model, PaginateModel, Schema } from 'mongoose';
import { baseSchema } from './base-schema';
import { baseSchemaOptions } from './base-schema-config';
import moongosePaginate from 'mongoose-paginate-v2';

export interface IGraphWayIntersection extends BaseDocument {
	nodeId: string;
	coord: {
		type: string;
		coordinates: [number, number];
	};
	connections: string[];
}

const GraphWayIntersectionSchema = new Schema<IGraphWayIntersection>(
	{
		...baseSchema,
		nodeId: {
			type: String,
			required: true,
		},
		coord: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		connections: [
			{
				type: String,
				ref: 'Way',
			},
		],
	},
	baseSchemaOptions
);

GraphWayIntersectionSchema.index({ coord: '2dsphere' });
GraphWayIntersectionSchema.index({ nodeId: 1 }, { unique: true });
GraphWayIntersectionSchema.plugin(moongosePaginate);

export const graphWayIntersection = model<
	IGraphWayIntersection,
	PaginateModel<IGraphWayIntersection>
>('GraphWayIntersection', GraphWayIntersectionSchema, 'graphWayIntersections');
