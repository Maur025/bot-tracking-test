import { describe, expect, test, vi, Mock } from 'vitest';

vi.mock('@services/simulate-movement/generate-valid-location', () => ({
	generateValidLocation: vi.fn().mockResolvedValue([12.3456, 98.7654]),
}));

vi.mock('@services/simulate-movement/get-route-to-travel', () => ({
	getRouteToTravel: vi.fn().mockResolvedValue([
		[12.3456, 98.7654],
		[12.3457, 98.7653],
	]),
}));

vi.mock('@services/simulate-movement/get-mei-track-payload', () => ({
	getMeiTrackPayload: vi.fn(() => '**simulated-payload'),
}));

vi.mock('@utils/emit-data-for-udp', () => ({
	emitDataForUdp: vi.fn(() => {}),
}));

vi.mock('@services/simulate-movement/simulate-delay', () => ({
	simulateDelay: vi.fn().mockResolvedValue(undefined),
}));

import { botMove } from '@services/bot-action/bot-move';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { getMeiTrackPayload } from '@services/simulate-movement/get-mei-track-payload';
import { emitDataForUdp } from '@utils/emit-data-for-udp';
import { simulateDelay } from '@services/simulate-movement/simulate-delay';
import { generateValidLocation } from '@services/simulate-movement/generate-valid-location';
import { getRouteToTravel } from '@services/simulate-movement/get-route-to-travel';

describe('bot-move', () => {
	test('should received a bot as parameter', async () => {
		await expect(botMove(undefined)).rejects.toThrow();
	});

	test('should bot asign valid position before move', async () => {
		await botMove({ lat: '0', lon: '0' } as DeviceBotCache);

		await expect(generateValidLocation).toHaveBeenCalled();
	});

	test('should have a route before begin to move', async () => {
		const bot = {
			assignedRoute: 'false',
			routeTravel: undefined,
		} as DeviceBotCache;

		await botMove(bot);

		await expect(getRouteToTravel).toHaveBeenCalledWith(
			expect.objectContaining({ bot })
		);
		expect(bot.assignedRoute).toEqual('true');
		expect(bot.routeTravel).toBeDefined();
	});

	test('should bot before move have ignition status in on', async () => {
		const bot = {
			ignition: '0',
			event: '',
		} as DeviceBotCache;

		await botMove(bot);

		expect(bot.ignition).toEqual('1');
		expect(bot.event).toEqual('144');

		expect(getMeiTrackPayload).toHaveBeenCalledWith(
			expect.objectContaining({ bot })
		);

		const getPayloadMock = getMeiTrackPayload as Mock;
		const payload = getPayloadMock.mock.results[0].value;

		expect(emitDataForUdp).toHaveBeenCalledWith(payload);
		await expect(simulateDelay).toHaveBeenCalledWith(1);
	});

	test('should bot if ignition is on, event to emit is reply', async () => {
		const bot = {
			ignition: '1',
			event: '',
			lon: '98.76543',
			lat: '12.34567',
		} as DeviceBotCache;

		await botMove(bot);

		expect(bot.event).toEqual('34');
		expect(bot.lon).not.toEqual('98.76543');
		expect(bot.lat).not.toEqual('12.34567');

		expect(getMeiTrackPayload).toHaveBeenCalledWith(
			expect.objectContaining({ bot })
		);

		const getPayloadMock = getMeiTrackPayload as Mock;
		const payload = getPayloadMock.mock.results[0].value;

		expect(emitDataForUdp).toHaveBeenCalledWith(payload);
		await expect(simulateDelay).toHaveBeenCalledWith(1);
	});
});
