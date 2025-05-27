import env from '@config/env';
import { loggerDebug, loggerError } from '@maur025/core-logger';
import dgram from 'node:dgram';

const { UDP_HOST, UDP_PORT } = env;
const udpClient: dgram.Socket = dgram.createSocket('udp4');

export const emitDataForUdp = (data: string): void => {
	const message = Buffer.from(data, 'ascii');

	udpClient.send(message, UDP_PORT, UDP_HOST, error => {
		if (error) {
			loggerError('Error sending message: ', error);
		} else {
			loggerDebug(`GPS data send: ${message.toString()}`);
		}
	});
};
