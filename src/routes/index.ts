import express, { Router } from 'express';
import authRouter from './auth.routes.js';
import courseRouter from './course.routes.js';
import educatorRouter from './educator.routes.js';
import userRouter from './user.routes.js';
import quizRouter from './quiz.routes.js';
import progressRouter from './progress.routes.js';
import learningRouter from './learning.routes.js';
import studentRouter from './student.routes.js';
import bookmarkRouter from './bookmark.routes.js';
import noteRouter from './note.routes.js';

const apiRouter: Router = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/courses', courseRouter);
apiRouter.use('/course', courseRouter);
apiRouter.use('/educator', educatorRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/quiz', quizRouter);
apiRouter.use('/progress', progressRouter);
apiRouter.use('/learning', learningRouter);
apiRouter.use('/student', studentRouter);
apiRouter.use('/bookmarks', bookmarkRouter);
apiRouter.use('/notes', noteRouter);

export default apiRouter;
