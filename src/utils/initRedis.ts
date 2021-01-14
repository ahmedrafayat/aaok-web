import redis = require('redis');

const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1',
});

client.on('connect', function () {
  console.log('Client connected to redis');
});

client.on('ready', () => {
  console.log('Client connected to redis and ready to use...');
});

client.on('error', (err) => {
  console.log(err.message);
});

client.on('end', () => {
  console.log('Client disconnected from redis');
});

client.on('SIGINT', () => {
  client.quit();
});

export const redisClient = client;
