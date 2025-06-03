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
	// bot control topics
	BOT_GET_IS_RUNNING: 'bot:get:is-running',
	BOT_IS_RUNNING: 'bot:is-running',
	BOT_REQ_STOP: 'bot:req-stop',
	BOT_REQ_STOP_RESPONSE: 'bot:req-stop:response',
	BOT_REQ_START: 'bot:req-start',
	BOT_REQ_START_RESPONSE: 'bot:req-start:response',
	// Server side events
	PROPAGATE_ORDER_INITIALIZE_BOTS: 'propagate-order:initialize-bots',
	PROPAGATE_START_BOTS: 'propagate:start-bots',
	PROPAGATE_STOP_BOTS: 'propagate:stop-bots',
} as const;
