let index: number = 0;

const serialNumber: string = '0000000f62f29f7';

const state: 'A' | 'V' = 'A';

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
