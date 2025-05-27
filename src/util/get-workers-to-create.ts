import { pipe } from '@maur025/core-common';

const getQuantityCpuSystemReserved = (numberCpus: number): number => {
	switch (numberCpus) {
		case 1: {
			return 0;
		}
		case 2: {
			return 1;
		}
		case 4:
		case 6: {
			return 2;
		}
		case 8: {
			return 6;
		}
		case 12: {
			return 4;
		}
		case 16: {
			return 8;
		}
		case 20: {
			return 16;
		}
		default: {
			return numberCpus - 1;
		}
	}
};

export const getWorkersToCreate = (numberCpus: number): number =>
	pipe(
		numberCpus,
		getQuantityCpuSystemReserved,
		(availableCpus: number) => numberCpus - availableCpus
	);
