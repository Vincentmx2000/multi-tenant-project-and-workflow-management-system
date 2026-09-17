import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { initSocketHandler } from './socket/socketHandler';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import commentRoutes from './routes/commentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import activityRoutes from './routes/activityRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import companyRoutes from './routes/companyRoutes';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/company', companyRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocketHandler(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
