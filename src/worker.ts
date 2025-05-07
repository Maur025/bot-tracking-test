import express, { Application } from 'express';

const app: Application = express();
const port: number = 3000;

app.listen(port, () => {
	console.log(`Worker: ${process.pid} running Express on port ${port}`);
});
