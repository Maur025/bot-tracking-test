import fs from 'node:fs';
import { DOMParser } from 'xmldom';
import { kml } from '@tmcw/togeojson';
import type { FeatureCollection, Geometry } from 'geojson';

export const getBotRoute = (): [number, number][] => {
	const kmlFilePath: string = `${process.cwd()}/src/config/bot-route/route.kml`;

	const kmlData: string = fs.readFileSync(kmlFilePath, 'utf-8');

	const dom: Document = new DOMParser().parseFromString(kmlData);

	const geojson: FeatureCollection<Geometry | null> = kml(dom);

	const coordinates: [number, number][] = [];

	geojson.features?.forEach(feature => {
		const { geometry } = feature;

		if (geometry?.type === 'LineString') {
			geometry?.coordinates?.forEach(coord => {
				const [lon, lat] = coord;
				coordinates.push([lat, lon]);
			});
		}
	});

	return coordinates;
};
