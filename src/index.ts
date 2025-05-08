import dgram from 'node:dgram';
import cluster, { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import { getBotRoute } from 'service/get-bot-route';

const numberCpus = cpus().length;

if (cluster.isPrimary && numberCpus > 2) {
	console.log(`Primary process ${process.pid} is running`);

	let cpuSystemReserved: number = 0;

	switch (numberCpus) {
		case 4:
		case 6:
		case 8: {
			cpuSystemReserved = 2;
			break;
		}
		case 12: {
			cpuSystemReserved = 4;
			break;
		}
		case 16: {
			cpuSystemReserved = 8;
			break;
		}
		default: {
			cpuSystemReserved = 1;
		}
	}

	let workerIndex: number = 0;
	const workersToCreate = numberCpus - cpuSystemReserved;

	while (workerIndex < workersToCreate) {
		cluster.fork();

		workerIndex++;
	}

	cluster.on('online', (worker: Worker) => {
		console.log(`Worker ${worker.process.pid} running.`);
	});
} else {
	await import('./worker');
}

const client = dgram.createSocket('udp4');
const PORT = 8888;
const HOST = '172.20.50.60';

const botRoute: [number, number][] = getBotRoute();

let index: number = 0;

const serialNumber: string = '0000000f62f29f7';
const imei: string = '123456789012345';
const cmd: 'GPRMC' | 'AAA' = 'AAA';
const state: 'A' | 'V' = 'A';

const getTimestamp = () => {
	const date = new Date();

	const year = String(date.getUTCFullYear()).slice(2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getUTCHours()).padStart(2, '0');
	const minutes = String(date.getUTCMinutes()).padStart(2, '0');
	const seconds = String(date.getUTCSeconds()).padStart(2, '0');
	const miliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

	return `${year}${month}${day}${hours}${minutes}${seconds}${miliseconds}`;
};

const convertNmeaFormat = (coord: number): string => {
	const absCoord: number = Math.abs(coord);

	const degrees: number = Math.floor(absCoord);
	const minutes: number = (absCoord - degrees) * 60;

	const degressStr = String(degrees).padStart(2, '0');
	const minutesStr = minutes.toFixed(4).padStart(7, '0');

	return `${degressStr}${minutesStr}`;
};

// const getLatitude = (lat: number): string => {
// 	const direction: string = lat > 0 ? 'N' : 'S';

// 	return `${convertNmeaFormat(lat)}`;
// };

// const getLongitude = (lon: number): string => {
// 	const direction: string = lon > 0 ? 'E' : 'W';

// 	return `${convertNmeaFormat(lon)}`;
// };

const getChecksumHex = (payload: string): string => {
	let checksum: number = 0;

	for (let i = 0; i < payload.length; i++) {
		checksum ^= payload.charCodeAt(i);
	}

	return checksum.toString(16).toUpperCase().padStart(2, '0');
};

const getPayloadLength = (payload: string): string => {
	return payload.length?.toString();
};

const sendPositionBot = (): void => {
	const coords = botRoute[index];

	const now = Date.now();

	// $$<length><command>,<imei>,<command>,<event>,<lat>,<lon>,<timestamp>,A,...*<checksum>
	const payload: string = `${imei},${cmd},22,${coords[0]},${
		coords[1]
	},${getTimestamp()},A,0,10,40.00,0,0,0,0,3600,100,1,0,0,0`;

	const gpsMeiData: string = `$$${getPayloadLength(
		payload
	)},${payload}*${getChecksumHex(payload)}`;

	const message = Buffer.from(gpsMeiData, 'ascii');

	console.log(`Sending GPS data: ${message}`);
	client.send(message, PORT, HOST, error => {
		if (error) {
			console.error('Error sending message:', error);
		} else {
			console.log('Message sent successfully');
		}
	});

	index++;

	if (index >= botRoute.length) {
		index = 0;
	}
};

// setInterval(sendPositionBot, 3000);
