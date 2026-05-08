import express, { Express } from 'express';
import { config } from './config';
import db from './db';
import userRouter from './users/route';
import authRouter  from "./auth/route";
import projectsRouter from "./projects/route";
import memberRouter from './project_members/route';
import taskRouter from './tasks/route';
import commentRouter from './task_comments/route';
import historyRouter from './history/route';
import { errorHandler } from './middleware/errorHandler';
import { rateLimit } from "express-rate-limit";

const app: Express = express();
const PORT = config.port;
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth/v1', authRouter);
app.use('/users',   userRouter);
app.use('/project', projectsRouter);
app.use('/member', memberRouter);
app.use('/task', taskRouter);
app.use('/comment', commentRouter);
app.use('/history', historyRouter);

app.use(errorHandler);

async function main() {
    await db.init();
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`);
    });
}

main();
