import env from '@config/env';
import { loggerInfo } from '@maur025/core-logger';
import { SocketTopic } from '@src/socket-topics';
import { io, Socket } from 'socket.io-client';

const SOCKET_NAME = 'socket-bridge-client-primary';

const { CONNECT } = SocketTopic;

let socketBridge: Socket | null = null;

export const socketBridgeConnect = (): Socket => {
	const socket: Socket = io(`http://localhost:${env.PORT}`, {
		reconnection: true,
	});

	socket.on(CONNECT, () => {
		loggerInfo(
			`[${SOCKET_NAME}] connected to http://localhost:${env.PORT} with id '${socket.id}'`
		);
	});

	return socket;
};

export const getSocketBridge = (): Socket => {
	if (!socketBridge) {
		socketBridge = socketBridgeConnect();
	}

	return socketBridge;
};
