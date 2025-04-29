export const randomNumberBetweenDigits = (min: number, max: number): number => {
	const minNumber: number = Math.pow(10, min - 1);
	const maxNumber: number = Math.pow(10, max) - 1;

	return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
};
