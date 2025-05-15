import { connectToDabase } from '@config/database/database-config';
import { loggerInfo } from '@maur025/core-logger';
import express, { Application } from 'express';
import { kafkaSubscribeConsumer } from 'kafka-worker/kafka-subscribe-consumer';

const app: Application = express();
const port: number = 3000;

connectToDabase();

app.listen(port, () => {
	loggerInfo(`Worker [${process.pid}] running Express on port [${port}]`);
});

kafkaSubscribeConsumer();
