export const simulateDelay = (seconds: number): Promise<unknown> =>
	new Promise(resolve => setTimeout(resolve, seconds * 1000));
