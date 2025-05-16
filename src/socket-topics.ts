export const SocketTopic = {
	// base topics
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',
	// room topics
	ROOM_JOIN: 'room:join',
	ROOM_LEAVE: 'room:leave',
	// device topics
	DEVICE_LOCATION_LAST: 'device-location:last',
} as const;
