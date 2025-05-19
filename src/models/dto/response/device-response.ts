import { BaseData } from '@maur025/core-model-data';

export interface Device extends BaseData {
	_id: string;
	imei: string;
	referenceCaptureId: string;
	name: string;
	status?: string;
	palque: string;

	createAt: Date;
	updateAt: Date;
}
