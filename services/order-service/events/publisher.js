const amqplib = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Order Service connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection failed:', err.message);
    setTimeout(connectRabbitMQ, 5000); // retry after 5s
  }
};

const publishEvent = async (queue, data) => {
  try {
    if (!channel) await connectRabbitMQ();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    console.log(`Event published → ${queue}:`, data);
  } catch (err) {
    console.error('Failed to publish event:', err.message);
  }
};

module.exports = { connectRabbitMQ, publishEvent };