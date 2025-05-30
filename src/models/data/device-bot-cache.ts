import { Position } from 'geojson';

export interface DeviceBotCache {
	id: string;
	referenceCaptureId: string;
	name: string;
	imei: string;
	cmd: 'GPRMC' | 'AAA';
	event: string; // number of event
	lat: string; // number of coord latitude
	lon: string; // number of coord longitude
	date: string;
	stateGps: 'A';
	usedSatellites: string; // number .. cuantity of satellites or similitude datos
	acc: string; // number .. accuracy
	speed: string; // -> number of speed in format 00.00
	odometer: string; // -> quantity km traveled in number example : 3600
	bateryLevel: string; // -> percentage or mv, number 1 to 100 in case percentage
	ignition: string; // 0 == off or 1 == on
	analog: string; // represent value as number
	einfo: string; // represent value as number
	custom: string; // represent value as number
	running: 'true' | 'false'; // string con 2 values
	inMovement: 'true' | 'false';
	assignedRoute: 'true' | 'false';
	routeTravel?: Position[];
	distanceCurrentlyTraveled?: number;
	programWait?: Date;
}
