import Environment from '@models/interface/environment';

const {
	PORT = '3000',
	DB_USER = 'root',
	DB_PASSWORD = '123456',
	DB_HOST = 'localhost',
	DB_PORT = '27017',
	TRACK_URL = 'http://localhost:7777',
} = process.env;

const env: Environment = {
	PORT: Number(PORT),
	DB_HOST,
	DB_PORT: Number(DB_PORT),
	DB_USER,
	DB_PASSWORD,
	TRACK_URL,
};

export default env;
