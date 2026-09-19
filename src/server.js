import env from './config/environment.js';
import app from './app.js';
import connectDB from './config/database.js';

const PORT = env.PORT || 8000;
const HOST = env.HOST || 'localhost';
const startServer = async () => {
  app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();