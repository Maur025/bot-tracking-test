import { readFileSync, writeFile } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const vehicleWayTypes = [
	'motorway',
	'trunk',
	'primary',
	'secondary',
	'tertiary',
	'unclassified',
	'residential',
	'service',
	'motorway_link',
	'trunk_link',
	'primary_lnk',
	'secondary_link',
	'tertiary_link',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const filterOnlyVehicleWay = () => {
	const waysData = JSON.parse(
		readFileSync(join(__dirname, '../config/ways.geojson'), 'utf8')
	);

	const onlyVehicleWays = waysData?.features?.filter(
		feature =>
			feature.geometry?.type === 'LineString' &&
			vehicleWayTypes.includes(feature.properties?.highway)
	);

	console.log(waysData?.features?.length || 0);
	console.log(onlyVehicleWays?.length);

	return {
		vehicleWays: onlyVehicleWays,
	};
};

const vehicleWayData = filterOnlyVehicleWay();

writeFile(
	join(__dirname, '../config/only-vehicle-ways.json'),
	JSON.stringify(vehicleWayData, null, 2),
	error => {
		if (error) {
			console.log('Error creating only vehicle ways: ', error);
		} else {
			console.log('Only vehicle ways created successfull');
		}
	}
);
