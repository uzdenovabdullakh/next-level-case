import { config } from './config';
import { pool } from './db';

interface MessageContent {
  pattern: string
  data: {
    id: string,
    title: string,
    description: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    priority: 'high' | 'medium' | 'low',
    createdAt: Date,
    startedAt: Date | null,
    completedAt: Date | null
  }
}

export const processTask = async (content: MessageContent) => {
  const client = await pool.connect();
  try {
    const { id } = content.data;

    await client.query('BEGIN');

    await client.query(
      'UPDATE tasks SET status = $1, started_at = NOW() WHERE id = $2',
      ['processing', id]
    );

    console.log(`Task ${id} processing started`);

    // Имитация сеттаймаутом
    await new Promise((resolve) => setTimeout(resolve, Number(config.WORKER_TIMEOUT) || 600000));

    await client.query(
      'UPDATE tasks SET status = $1, completed_at = NOW() WHERE id = $2',
      ['completed', id]
    );

    await client.query('COMMIT');
    console.log(`Task ${id} processing completed`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing task:', error);
  } finally {
    client.release();
  }
};
