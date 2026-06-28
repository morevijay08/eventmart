require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const connectDB      = require('./config/db');
const paymentRoutes  = require('./routes/payment.routes');
const { connectRabbitMQ }   = require('./events/publisher');
const { connectSubscriber } = require('./events/subscriber');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/payments', paymentRoutes);
app.get('/health', (req, res) => res.json({ service: 'payment', status: 'running' }));

const start = async () => {
  await connectRabbitMQ();
  await connectSubscriber();
  app.listen(process.env.PORT, () => {
    console.log(`Payment service running on port ${process.env.PORT}`);
  });
};

start();