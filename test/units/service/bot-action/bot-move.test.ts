import { describe, expect, test, vi } from 'vitest';
import { botMove } from '../../../../src/service/bot-action/bot-move';
import { DeviceBotCache } from '../../../../src/models/data/device-bot-cache';

describe('bot-move', () => {
	vi.mock('../../../../src/service/get-mei-track-payload', () => ({
		getMeiTrackPayload: vi.fn(() => '**payload'),
	}));

	test('should received a bot as parameter', () => {
		expect(() => botMove(undefined)).toThrow();
	});

	test('should bot before move have a valid position', () => {
		expect(() => botMove({ lat: '0', lon: '0' })).throw();
	});

	test('should bot before move have ignition status in on', () => {
		const bot: Partial<DeviceBotCache> = {
			ignition: '0',
			event: '',
		};

		botMove(bot);

		expect(bot.ignition).toEqual('1');
		expect(bot.event).toEqual('144');
	});

	test('should bot if ignition is on, event to emit is reply', () => {
		const bot: Partial<DeviceBotCache> = {
			ignition: '1',
			event: '',
			lat: '12.34567',
			lon: '98.76543',
		};

		botMove(bot);

		expect(bot.event).toEqual('34');
		expect(bot.lon).not.toEqual('98.76543');
		expect(bot.lat).not.toEqual('12.34567');
	});
});
