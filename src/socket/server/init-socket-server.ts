import env from '@config/env';
import { loggerDebug, loggerInfo } from '@maur025/core-logger';
import { setupWorker } from '@socket.io/sticky';
import { Server as HttpServer } from 'http';
import { createClient } from 'redis';
import { botManager } from 'service/bot-manager';
import { SocketTopic } from 'socket-topics';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const SOCKET_SERVER_NAME = `socket-server-${process.pid}`;
const {
	CONNECTION,
	DISCONNECT,
	ROOM_JOIN,
	ROOM_LEAVE,
	ROOM_JOIN_RESPONSE,
	ROOM_LEAVE_RESPONSE,
	DEVICES_PUBLISHED_IN_KAFKA,
	PROPAGATE_ORDER_INITIALIZE_BOTS,
} = SocketTopic;

let io: Server;

export const initSocketServer = async (
	httpServer: HttpServer
): Promise<Server> => {
	io = new Server(httpServer, {
		cors: { origin: '*', methods: ['GET', 'POST'] },
	});

	const pubClient = createClient({
		url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
	});
	const subClient = pubClient.duplicate();

	await pubClient.connect();
	await subClient.connect();

	io.adapter(createAdapter(pubClient, subClient));

	const adapter = io.of('/').adapter;
	adapter.on('message', () => {});

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

			socket.emit(ROOM_JOIN_RESPONSE, `join to room "${roomName}" succesfull`);
		});

		socket.on(ROOM_LEAVE, (roomName: string) => {
			socket.leave(roomName);
			loggerInfo(
				`[${SOCKET_SERVER_NAME}] socket '${socket.id}' left room '${roomName}'`
			);

			socket.emit(
				ROOM_LEAVE_RESPONSE,
				`leave to room "${roomName}" succesfull`
			);
		});

		socket.on(DEVICES_PUBLISHED_IN_KAFKA, message => {
			io.serverSideEmit(PROPAGATE_ORDER_INITIALIZE_BOTS, message);
			loggerDebug(message);
			botManager.initializeBots();
		});
	});

	io.on(PROPAGATE_ORDER_INITIALIZE_BOTS, message => {
		loggerDebug(message);
		botManager.initializeBots();
	});

	return io;
};

export const getIo = (): Server => {
	if (!io) {
		throw new Error('socket.io server not initialized');
	}

	return io;
};
