import { v4 as uuidv4 } from 'uuid';
export const baseSchema = {
	_id: {
		type: String,
		default: uuidv4,
	},
	deleted: { type: Boolean, default: false },
};
