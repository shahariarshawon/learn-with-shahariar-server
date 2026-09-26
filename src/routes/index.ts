import express, { Router } from 'express';
import authRouter from './auth.routes.js';
import courseRouter from './course.routes.js';
import educatorRouter from './educator.routes.js';
import userRouter from './user.routes.js';
import quizRouter from './quiz.routes.js';

const apiRouter: Router = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/courses', courseRouter); // Professional LMS Courses API
apiRouter.use('/course', courseRouter);  // Legacy compatibility alias
apiRouter.use('/educator', educatorRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/quiz', quizRouter);

export default apiRouter;
