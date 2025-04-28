import dgram from 'node:dgram';
import { getBotRoute } from 'service/get-bot-route';

const client = dgram.createSocket('udp4');
const PORT = 8888;
const HOST = '172.20.50.60';

const botRoute: [number, number][] = getBotRoute();

let index: number = 0;

const sendPositionBot = (): void => {
	const coords = botRoute[index];

	const gpsData = {
		deviceId: 'mauro-bot-test-1',
		lat: coords[0],
		lon: coords[1],
		speed: 50 + Math.random() * 10,
	};

	const message = Buffer.from(JSON.stringify(gpsData));

	console.log(`Sending GPS data: ${message}`);
	client.send(message, PORT, HOST, error => {
		if (error) {
			console.error('Error sending message:', error);
		} else {
			console.log('Message sent successfully');
		}
	});

	index++;

	if (index > botRoute.length) {
		index = 0;
	}
};

setInterval(sendPositionBot, 5000);
