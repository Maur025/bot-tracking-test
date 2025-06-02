import Environment from '@models/interface/environment';

const {
	PORT = '3000',
	DB_USER = 'root',
	DB_PASSWORD = '123456',
	DB_HOST = 'localhost',
	DB_PORT = '27017',
	TRACK_URL = 'http://localhost:7777',
	REDIS_HOST = 'localhost',
	REDIS_PORT = '6379',
	KAFKA_BROKER = 'localhost:9092',
	DB_NAME = 'DeviceBotDb',
	UDP_HOST = 'localhost',
	UDP_PORT = '8888',
	CPU_TO_USE = '1',
	DEVICE_QUANTITY = '1',
	MIN_SPEED_MS = '8',
	MAX_SPEED_MS = '26',
	INITIAL_SPEED_MS = '13',
} = process.env;

const env: Environment = {
	PORT: Number(PORT),
	DB_HOST,
	DB_PORT: Number(DB_PORT),
	DB_USER,
	DB_PASSWORD,
	TRACK_URL,
	KAFKA_BROKER,
	REDIS_HOST,
	REDIS_PORT: Number(REDIS_PORT),
	DB_NAME,
	UDP_HOST,
	UDP_PORT: Number(UDP_PORT),
	CPU_TO_USE: Number(CPU_TO_USE),
	DEVICE_QUANTITY: Number(DEVICE_QUANTITY),
	MIN_SPEED_MS: Number(MIN_SPEED_MS),
	MAX_SPEED_MS: Number(MAX_SPEED_MS),
	INITIAL_SPEED_MS: Number(INITIAL_SPEED_MS),
};

export default env;
