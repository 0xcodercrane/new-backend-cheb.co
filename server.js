import express from 'express';
import environment from 'dotenv';
import colors from 'colors';
import cors from 'cors';

import fileUpload from 'express-fileupload';

import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import morgan from 'morgan';
// route imports
import routes from './routes/routes.js';
import Stripe from 'stripe';
import migrationRoutes from '#routes/migrationRoutes.js';

const dotenv = environment.config();

const port = process.env.PORT || 3055;

connectDB();
const app = express();

app.use(
  cors({
    origin: '*',
  }),
);

//middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, //5MB max file(s) size
  }),
);

app.use(express.static('public'));

// routes
app.use(morgan('dev'));

app.use('/api', routes);
app.use('/api', migrationRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server Started On Port ${port}`));
