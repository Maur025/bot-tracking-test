import { Document } from 'mongoose';

export interface BaseDocument extends Document {
	_id: string;
	createAt: Date;
	updateAt: Date;
	deleted: boolean;
}
