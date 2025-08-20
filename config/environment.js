// Environment variables are now provided by AWS Elastic Beanstalk
// No need to load from .env file in production

// For local development, you can still use dotenv if needed
if (process.env.NODE_ENV === 'development' || process.env.ENV === 'LOCAL') {
  const { config } = await import('dotenv');
  config({ path: './.env' });
}
