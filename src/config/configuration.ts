export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  db: {
    client: process.env.DB_CLIENT || 'mysql2',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'demo_credit',
    fileName: process.env.DB_FILENAME || './dev.sqlite3',
    testClient: process.env.DB_CLIENT || 'sqlite3',
    testFilename: process.env.DB_FILENAME || ':memory:',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  },
  adjutor: {
    baseUrl: process.env.ADJUTOR_API_BASE || '',
    apiKey: process.env.ADJUTOR_API_KEY || '',
  },
});
