import { connectToDabase } from '@config/database/database-config';
import { initSocketServer } from '@socket/server/init-socket-server';
import express, { Application } from 'express';
import { createServer, Server } from 'http';
import { kafkaSubscribeConsumer } from 'kafka-worker/kafka-subscribe-consumer';
import cors from 'cors';
import router from '@routes/index.routes';
import { initRedisClient } from '@config/redis/create-redis-client';

const app: Application = express();
app.use(
	cors({
		origin: '*',
		optionsSuccessStatus: 200,
	})
);
app.use('/api', router);
app.use('/test', (req, res) => {
	res.json({ message: 'Server express working' });
});

const httpServer: Server = createServer(app);

await connectToDabase();

await initRedisClient();

initSocketServer(httpServer);

kafkaSubscribeConsumer();
