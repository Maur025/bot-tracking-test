import { pipe } from '@maur025/core-common';

const getQuantityCpuSystemReserved = (numberCpus: number): number => {
	switch (numberCpus) {
		case 4:
		case 6:
		case 8: {
			return 2;
		}
		case 12: {
			return 4;
		}
		case 16: {
			return 8;
		}
		default: {
			return 1;
		}
	}
};

export const getWorkersToCreate = (numberCpus: number): number =>
	pipe(
		numberCpus,
		getQuantityCpuSystemReserved,
		(availableCpus: number) => numberCpus - availableCpus
	);
