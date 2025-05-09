import { connectToDabase } from '@config/database/database-config';
import express, { Application } from 'express';

const app: Application = express();
const port: number = 3000;

connectToDabase();

app.listen(port, () => {
	console.log(`Worker: ${process.pid} running Express on port ${port}`);
});
