import env from '@config/env';
import { loggerError, loggerInfo } from '@maur025/core-logger';
import { connect } from 'mongoose';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = env;

export const connectToDabase = async (): Promise<void> => {
	const uridb: string = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/DeviceBotDb?authSource=admin`;

	try {
		const mongooseConnection = await connect(uridb);
		loggerInfo(
			`[Mongo-db] connected to database: '${mongooseConnection.connection.name}'`
		);
	} catch (error) {
		loggerError(
			'Error connecting to database: ',
			error instanceof Error ? error : undefined
		);
	}
};
