import env from '@config/env';
import { pipe } from '@maur025/core-common';

const { CPU_TO_USE } = env;

const getQuantityCpuSystemReserved = (numberCpus: number): number => {
	switch (numberCpus) {
		case 1: {
			return 0;
		}
		case 2: {
			return calculateCpuToReserve(2);
		}
		case 4: {
			return calculateCpuToReserve(4);
		}
		case 6: {
			return calculateCpuToReserve(6);
		}
		case 8: {
			return calculateCpuToReserve(8);
		}
		case 12: {
			return calculateCpuToReserve(12);
		}
		case 16: {
			return calculateCpuToReserve(16);
		}
		case 20: {
			return calculateCpuToReserve(20);
		}
		default: {
			return numberCpus - 1;
		}
	}
};

const calculateCpuToReserve = (totalCpus: number) => {
	return CPU_TO_USE < totalCpus ? totalCpus - CPU_TO_USE : totalCpus - 1;
};

export const getWorkersToCreate = (numberCpus: number): number =>
	pipe(
		numberCpus,
		getQuantityCpuSystemReserved,
		(reservedCpus: number) => numberCpus - reservedCpus
	);
