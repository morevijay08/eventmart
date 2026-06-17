require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cart.routes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/cart', cartRoutes);
app.get('/health', (req, res) => res.json({ service: 'cart', status: 'running' }));

app.listen(process.env.PORT, () => {
  console.log(`Cart service running on port ${process.env.PORT}`);
});