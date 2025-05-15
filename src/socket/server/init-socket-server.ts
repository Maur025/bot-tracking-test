import { loggerInfo } from '@maur025/core-logger';
import { Server as HttpServer } from 'http';
import { SocketTopic } from 'socket-topics';
import { Server } from 'socket.io';

const SOCKET_SERVER_NAME = 'Socket-server';
const { CONNECTION, DISCONNECT } = SocketTopic;

let io: Server;

export const initSocketServer = (httpServer: HttpServer): Server => {
	io = new Server(httpServer, {
		cors: { origin: '*', methods: ['GET', 'POST'] },
	});

	io.on(CONNECTION, socket => {
		loggerInfo(
			`[${SOCKET_SERVER_NAME}] new client connected with id '${socket.id}'`
		);

		socket.on(DISCONNECT, () => {
			loggerInfo(
				`[${SOCKET_SERVER_NAME}] client with id '${socket.id}' disconnected`
			);
		});
	});

	return io;
};

export const getIo = (): Server => {
	if (!io) {
		throw new Error('socket.io server not initialized');
	}

	return io;
};
