import express from 'express'
import 'dotenv/config'
import cors from 'cors'

import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinay from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import quizRouter from './routes/quizRoutes.js';

// initialize express 
const app = express();


// connect to db
await connectDB();
await connectCloudinay();


// middleware
app.use(cors({
  origin: "https://learn-with-shahariar.vercel.app",
  credentials: true
}));
app.use(clerkMiddleware())

connectCloudinary();
// Routes
app.get('/', (req, res) => { res.send("Learn with Shahariar API is working fine!") })
app.post('/clerk', express.json(), clerkWebhooks)
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.use("/api/quiz", express.json(), quizRouter);


// port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);

})