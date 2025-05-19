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
};

export default env;
