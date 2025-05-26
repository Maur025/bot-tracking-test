export const SocketTopic = {
	// base topics
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',
	CONNECT: 'connect',
	// room topics
	ROOM_JOIN: 'room:join',
	ROOM_LEAVE: 'room:leave',
	ROOM_JOIN_RESPONSE: 'room:join-response',
	ROOM_LEAVE_RESPONSE: 'room:leave-response',
	// device topics
	DEVICE_LOCATION_LAST: 'device-location:last',
	DEVICES_PUBLISHED_IN_KAFKA: 'devices:published-in-kafka',
	// Server side events
	PROPAGATE_ORDER_INITIALIZE_BOTS: 'propagate-order:initialize-bots',
} as const;
