import express from 'express';
import authRouter from './auth.routes.js';
import courseRouter from './course.routes.js';
import educatorRouter from './educator.routes.js';
import userRouter from './user.routes.js';
import quizRouter from './quiz.routes.js';

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/course', courseRouter);
apiRouter.use('/educator', educatorRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/quiz', quizRouter);

export default apiRouter;
