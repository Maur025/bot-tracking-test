import env from '@config/env';
import { loggerInfo } from '@maur025/core-logger';
import { io, Socket } from 'socket.io-client';

const SOCKET_NAME = 'Socket-client-track';

export const socketTrackConnect = (): void => {
	const socket: Socket = io(env.TRACK_URL, {
		reconnection: true,
		reconnectionDelay: 10000,
		reconnectionDelayMax: 15000,
		reconnectionAttempts: 15,
	});

	socket.on('connect', () => {
		loggerInfo(`[${SOCKET_NAME}] connected with id '${socket.id}'`);
	});

	socket.on('device.last', payload => {
		// console.log(payload);
	});
};
