import { connectToDabase } from '@config/database/database-config';
import { initSocketServer } from '@socket/server/init-socket-server';
import express, { Application } from 'express';
import { createServer, Server } from 'http';
import { kafkaSubscribeConsumer } from 'kafka-worker/kafka-subscribe-consumer';

const app: Application = express();
app.use('/test', (req, res) => {
	res.json({ message: 'Server express working' });
});
const httpServer: Server = createServer(app);

await connectToDabase();

initSocketServer(httpServer);

kafkaSubscribeConsumer();
