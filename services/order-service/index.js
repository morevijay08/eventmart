require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const connectDB   = require('./config/db');
const orderRoutes = require('./routes/order.routes');
const { connectRabbitMQ } = require('./events/publisher');
const { connectSubscriber } = require('./events/subscriber');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.get('/health', (req, res) => res.json({ service: 'order', status: 'running' }));

const start = async () => {
  await connectRabbitMQ();
  await connectSubscriber();
  app.listen(process.env.PORT, () => {
    console.log(`Order service running on port ${process.env.PORT}`);
  });
};

start();