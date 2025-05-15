import { connectToDabase } from '@config/database/database-config';
import env from '@config/env';
import { loggerInfo } from '@maur025/core-logger';
import { initSocketServer } from '@socket/server/init-socket-server';
import express, { Application } from 'express';
import { createServer, Server } from 'http';
import { kafkaSubscribeConsumer } from 'kafka-worker/kafka-subscribe-consumer';

const app: Application = express();
const httpServer: Server = createServer(app);

await connectToDabase();

const io = await initSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
	loggerInfo(`Worker [${process.pid}] running Express on port [${env.PORT}]`);
});

kafkaSubscribeConsumer();
