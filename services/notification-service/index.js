require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { connectSubscriber } = require('./events/subscriber');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'notification', status: 'running' }));

const start = async () => {
  await connectSubscriber();
  app.listen(process.env.PORT, () => {
    console.log(`Notification service running on port ${process.env.PORT}`);
  });
};

start();