export default interface Environment {
	PORT: number;
	DB_USER: string;
	DB_PASSWORD: string;
	DB_HOST: string;
	DB_PORT: number;
	TRACK_URL: string;
	KAFKA_BROKER: string;
	REDIS_HOST: string;
	REDIS_PORT: number;
	DB_NAME: string;
	UDP_HOST: string;
	UDP_PORT: number;
	CPU_TO_USE: number;
	DEVICE_QUANTITY: number;
	MIN_SPEED_MS: number;
	MAX_SPEED_MS: number;
	INITIAL_SPEED_MS: number;
}
