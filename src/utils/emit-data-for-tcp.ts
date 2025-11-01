import env from '@config/env';
import { loggerDebug, loggerError, loggerInfo } from '@maur025/core-logger';
import { Socket } from 'node:net';

const { TCP_HOST, TCP_PORT } = env;

const tcpClient = new Socket();

tcpClient.connect(TCP_PORT, TCP_HOST, () => {
	loggerInfo(
		`[TCP] (initTcpClient) Connected to TCP server at ${TCP_HOST}:${TCP_PORT}`
	);
});

tcpClient.on('error', error => {
	loggerError(`[TCP] (tcpClient) Error: ${error.message}`);
});

export const emitDataForTcp = (data: string): void => {
	const message = Buffer.from(data, 'ascii');
	tcpClient.write(message);
	loggerDebug(`[TCP] GPS data send: ${message.toString()}`);
};
