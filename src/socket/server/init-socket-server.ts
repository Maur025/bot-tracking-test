import { loggerInfo } from '@maur025/core-logger';
import { createAdapter } from '@socket.io/cluster-adapter';
import { setupWorker } from '@socket.io/sticky';
import { Server as HttpServer } from 'http';
import { SocketTopic } from 'socket-topics';
import { Server } from 'socket.io';

const SOCKET_SERVER_NAME = 'Socket-server';
const { CONNECTION, DISCONNECT, ROOM_JOIN, ROOM_LEAVE } = SocketTopic;

let io: Server;

export const initSocketServer = (httpServer: HttpServer): Server => {
	io = new Server(httpServer, {
		cors: { origin: '*', methods: ['GET', 'POST'] },
	});

	io.adapter(createAdapter());

	setupWorker(io);

	io.on(CONNECTION, socket => {
		loggerInfo(
			`[${SOCKET_SERVER_NAME}] new client connected with id '${socket.id}'`
		);

		socket.on(DISCONNECT, () => {
			loggerInfo(
				`[${SOCKET_SERVER_NAME}] client with id '${socket.id}' disconnected`
			);
		});

		socket.on(ROOM_JOIN, (roomName: string) => {
			socket.join(roomName);
			loggerInfo(
				`[${SOCKET_SERVER_NAME}] socket '${socket.id}' joined room '${roomName}'`
			);
		});

		socket.on(ROOM_LEAVE, (roomName: string) => {
			socket.leave(roomName);
			loggerInfo(
				`[${SOCKET_SERVER_NAME}] socket '${socket.id}' left room '${roomName}'`
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
