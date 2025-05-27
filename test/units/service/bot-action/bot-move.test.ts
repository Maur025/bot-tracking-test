import { describe, expect, test, vi, Mock } from 'vitest';

vi.mock('@services/simulate-movement/get-mei-track-payload', () => ({
	getMeiTrackPayload: vi.fn(() => '**simulated-payload'),
}));

vi.mock('@utils/emit-data-for-udp', () => ({
	emitDataForUdp: vi.fn(() => {}),
}));

import { botMove } from '@services/bot-action/bot-move';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackPayload } from '@services/simulate-movement/get-mei-track-payload';
import { emitDataForUdp } from '@utils/emit-data-for-udp';

describe('bot-move', () => {
	test('should received a bot as parameter', () => {
		expect(() => botMove(undefined)).toThrow();
	});

	test('should bot before move have a valid position', () => {
		expect(() => botMove({ lat: '0', lon: '0' } as DeviceBotCache)).throw();
	});

	test('should bot before move have ignition status in on', () => {
		const bot = {
			ignition: '0',
			event: '',
		} as DeviceBotCache;

		botMove(bot);

		expect(bot.ignition).toEqual('1');
		expect(bot.event).toEqual('144');
		expect(getMeiTrackPayload).toHaveBeenCalled();
		expect(getMeiTrackPayload).toHaveBeenCalledWith(
			expect.objectContaining({ bot })
		);

		const getPayloadMock = getMeiTrackPayload as Mock;
		const payload = getPayloadMock.mock.results[0].value;

		console.log(payload);

		expect(emitDataForUdp).toHaveBeenCalled();
		expect(emitDataForUdp).toHaveBeenCalledWith(payload);
	});

	test('should bot if ignition is on, event to emit is reply', () => {
		const bot = {
			ignition: '1',
			event: '',
			lat: '12.34567',
			lon: '98.76543',
		} as DeviceBotCache;

		botMove(bot);

		expect(bot.event).toEqual('34');
		expect(bot.lon).not.toEqual('98.76543');
		expect(bot.lat).not.toEqual('12.34567');
	});
});
