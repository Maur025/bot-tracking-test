import { io, Socket } from 'socket.io-client';

export const socketTrackConnect = (): void => {
	const socket: Socket = io('http://172.20.50.60:7777', {
		reconnection: true,
		reconnectionDelay: 10000,
		reconnectionDelayMax: 15000,
		reconnectionAttempts: 15,
	});

	socket.on('connect', () => {
		console.log(`conectado with id ${socket.id}`);

		// socket.emit('message', 'testing');
	});

	socket.on('device.last', payload => {
		console.log(payload);
	});
};
