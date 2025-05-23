import { BaseDocument } from '@models/interface/base-document';
import { model, PaginateModel, Schema } from 'mongoose';
import { baseSchemaOptions } from './base-schema-config';
import { baseSchema } from './base-schema';
import moongosePaginate from 'mongoose-paginate-v2';

enum DeviceStatus {
	ENABLE = 'ENABLE',
	DISABLE = 'DISABLE',
}

export interface IDevice extends BaseDocument {
	imei: string;
	referenceCaptureId: string;
	name: string;
	status: DeviceStatus;
	plaque: string;
	icon?: string;
	lastPosition: {
		type: 'Point';
		coordinates: [number, number];
	};
}

const DeviceSchema = new Schema<IDevice>(
	{
		...baseSchema,
		imei: {
			type: String,
			required: true,
		},
		referenceCaptureId: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(DeviceStatus),
			default: DeviceStatus.ENABLE,
		},
		plaque: {
			type: String,
		},
		icon: {
			type: String,
		},
		lastPosition: {
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
	},
	baseSchemaOptions
);

DeviceSchema.index({ lastPosition: '2dsphere' });
DeviceSchema.plugin(moongosePaginate);

export const Device = model<IDevice, PaginateModel<IDevice>>(
	'Device',
	DeviceSchema,
	'devices'
);
