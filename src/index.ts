import { connectToDabase } from '@config/database/database-config';
import express, { Application } from 'express';
import { kafkaSubscribeConsumer } from 'kafka-worker/kafka-subscribe-consumer';

const app: Application = express();
const port: number = 3000;

connectToDabase();

app.listen(port, () => {
	console.log(`Worker: ${process.pid} running Express on port ${port}`);
});

kafkaSubscribeConsumer();
