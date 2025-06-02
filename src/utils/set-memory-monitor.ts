import { loggerDebug } from '@maur025/core-logger';

export const setMemoryMonitor = (
	label: string,
	extraData: string = ''
): void => {
	const { rss, heapUsed } = process.memoryUsage();

	loggerDebug(
		`[${label}-${process.pid}] ${extraData} RAM: ${getMegabyteOfByte(
			heapUsed
		).toFixed(2)} MB, RSS: ${getMegabyteOfByte(rss).toFixed(2)} MB`
	);
};

const getMegabyteOfByte = (byte: number) => getKilobyteOfByte(byte) / 1024;

const getKilobyteOfByte = (byte: number) => byte / 1024;
