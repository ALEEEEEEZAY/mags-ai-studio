export const appConfig = () => ({
  app: {
    port: process.env.API_PORT || 3001,
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});
