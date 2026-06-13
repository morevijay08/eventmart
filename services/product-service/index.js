require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/product.routes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.get('/health', (req, res) => res.json({ service: 'product', status: 'running' }));

app.listen(process.env.PORT, () => {
  console.log(`Product service running on port ${process.env.PORT}`);
});