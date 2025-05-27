import { getMeiTrackPayloadLength } from '@utils/get-mei-track-payload-length';
import { describe, expect, test } from 'vitest';

describe('get mei track payload length', () => {
	test('should return the correct length of the mei track payload', () => {
		const payload: string = 'some payload';
		const result: string = getMeiTrackPayloadLength(payload);

		expect(result).toEqual(payload.length.toString());
	});
});
