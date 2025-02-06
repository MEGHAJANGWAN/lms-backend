import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from "./routes/user.routes.js";
import { config } from "dotenv";
import courseRoutes from './routes/course.routes.js';
import errorMiddelware from './middlewares/error.middleware.js';
config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());

app.use(morgan('dev'));


app.get('/', (req, res) => {
    res.send("Hello");
});

// app.get("/ping", (req, res) => {
//   res.send("<h1>pong</h1>");
// });

// routes of 3 modules

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes)

app.all('*', (req, res) => {
    res.status(404).send('OOPS! 404 page not found')
});

app.use(errorMiddelware);

export default app;

