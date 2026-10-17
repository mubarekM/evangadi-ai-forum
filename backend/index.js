import express from 'express';
import { db } from './db/config.js';
import { mainRouter } from './src/api/routes.js';
import { errorHandler } from './src/middleware/error-handler.js';
import { resetInterruptedDocumentsService } from './src/api/rag/service/rag.service.js';
import {
  ensureAdminSchema,
  ensureAnswerVotesSchema,
  ensureAnswerVectorsSchema,
  ensureNotificationsSchema,
} from './db/migrate.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3777;
const isVercel = Boolean(process.env.VERCEL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health checks
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'evangadi-ai-forum-api' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// PDF (RAG) upload needs a persistent disk and background workers, which free
// serverless hosting does not provide. It is switched off in the live demo only.
if (isVercel) {
  app.use('/api/rag', (req, res) => {
    res.status(503).json({
      status: false,
      message:
        'PDF upload is disabled in the live demo. It works when you run the project locally.',
    });
  });
}

app.use('/api', mainRouter);

app.use(errorHandler);

// Start server (only on your own computer; Vercel runs the app by itself)
const startServer = async () => {
  try {
    const connection = await db.getConnection();

    console.log('Database connection established successfully.');
    connection.release();

    await ensureAdminSchema();
    await ensureAnswerVotesSchema();
    await ensureAnswerVectorsSchema();
    await ensureNotificationsSchema();
    await resetInterruptedDocumentsService();

    app.listen(port, err => {
      if (err) {
        console.error('Failed to start the server:', err.message);
        process.exit(1);
      }
      console.log(`Server running on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error(
      'Failed to connect to the database. Server not started.',
      error.message,
    );
    process.exit(1);
  }
};

if (!isVercel) {
  startServer();
}

export default app;
