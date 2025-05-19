import env from '@config/env';
import { loggerError, loggerInfo } from '@maur025/core-logger';
import cluster from 'cluster';
import mongoose, { connect } from 'mongoose';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = env;

export const connectToDabase = async (): Promise<void> => {
	if (mongoose.connection.readyState >= 1) {
		return;
	}

	const uridb: string = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

	try {
		const mongooseConnection = await connect(uridb);
		loggerInfo(
			`[mongo-${
				cluster.isPrimary ? 'primary' : `worker-${process.pid}`
			}] connected to database: '${
				mongooseConnection.connection.name
			}' in http://${DB_HOST}:${DB_PORT}`
		);
	} catch (error) {
		loggerError(
			'Error connecting to database: ',
			error instanceof Error ? error : undefined
		);
	}
};

export const disconnectDatabase = (): Promise<void> => {
	return mongoose.disconnect();
};
