require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // ── MOBILES ──
  {
    name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'mobiles',
    description: 'Flagship Android phone with AI features, 200MP camera and Snapdragon 8 Gen 3.',
    price: 74999, originalPrice: 84999, discount: 12,
    thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
    stock: 50, isFeatured: true, isNewArrival: true,
    specs: new Map([['display','6.7 inch Dynamic AMOLED'],['ram','8GB'],['storage','256GB'],['battery','4000mAh'],['camera','200MP'],['os','Android 14']]),
    tags: ['samsung', 'android', 'flagship', 'smartphone']
  },
  {
    name: 'Apple iPhone 15', brand: 'Apple', category: 'mobiles',
    description: 'iPhone 15 with Dynamic Island, 48MP camera and USB-C charging.',
    price: 79999, originalPrice: 89999, discount: 11,
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'],
    stock: 40, isFeatured: true, isNewArrival: true,
    specs: new Map([['display','6.1 inch Super Retina XDR'],['ram','6GB'],['storage','128GB'],['battery','3877mAh'],['camera','48MP'],['os','iOS 17']]),
    tags: ['apple', 'iphone', 'ios', 'flagship']
  },
  {
    name: 'OnePlus 12', brand: 'OnePlus', category: 'mobiles',
    description: 'Hasselblad camera system, 100W fast charging and Snapdragon 8 Gen 3.',
    price: 64999, originalPrice: 69999, discount: 7,
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'],
    stock: 35, isFeatured: false, isNewArrival: true,
    specs: new Map([['display','6.82 inch LTPO AMOLED'],['ram','12GB'],['storage','256GB'],['battery','5400mAh'],['charging','100W']]),
    tags: ['oneplus', 'android', 'fast charging']
  },

  // ── LAPTOPS ──
  {
    name: 'MacBook Air M3', brand: 'Apple', category: 'laptops',
    description: 'Supercharged by M3 chip. Incredibly thin and light with all-day battery life.',
    price: 114999, originalPrice: 119999, discount: 4,
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    stock: 20, isFeatured: true, isNewArrival: true,
    specs: new Map([['processor','Apple M3'],['ram','8GB Unified'],['storage','256GB SSD'],['display','13.6 inch Liquid Retina'],['battery','18 hrs'],['os','macOS Sonoma']]),
    tags: ['apple', 'macbook', 'laptop', 'm3', 'ultrabook']
  },
  {
    name: 'Dell XPS 15', brand: 'Dell', category: 'laptops',
    description: 'Premium laptop with OLED display, Intel Core i7 and NVIDIA RTX 4060.',
    price: 149999, originalPrice: 169999, discount: 12,
    thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'],
    stock: 15, isFeatured: true, isNewArrival: false,
    specs: new Map([['processor','Intel Core i7-13700H'],['ram','16GB DDR5'],['storage','512GB SSD'],['display','15.6 inch OLED 3.5K'],['gpu','NVIDIA RTX 4060'],['battery','86Whr']]),
    tags: ['dell', 'xps', 'laptop', 'oled', 'gaming']
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon', brand: 'Lenovo', category: 'laptops',
    description: 'Ultra-light business laptop. Military-grade durability with all-day battery.',
    price: 134999, originalPrice: 149999, discount: 10,
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
    stock: 18, isFeatured: false, isNewArrival: false,
    specs: new Map([['processor','Intel Core i7-1365U'],['ram','16GB'],['storage','512GB SSD'],['display','14 inch IPS 2.8K'],['weight','1.12 kg'],['battery','15 hrs']]),
    tags: ['lenovo', 'thinkpad', 'business', 'ultrabook']
  },

  // ── AUDIO ──
  {
    name: 'Sony WH-1000XM5', brand: 'Sony', category: 'audio',
    description: 'Industry-leading noise cancellation with 30-hour battery and multipoint connection.',
    price: 29999, originalPrice: 34999, discount: 14,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    stock: 60, isFeatured: true, isNewArrival: false,
    specs: new Map([['type','Over-ear'],['connectivity','Bluetooth 5.2'],['battery','30 hrs'],['anc','Yes - Industry leading'],['weight','250g']]),
    tags: ['sony', 'headphones', 'noise cancelling', 'wireless']
  },
  {
    name: 'Apple AirPods Pro 2nd Gen', brand: 'Apple', category: 'audio',
    description: 'Adaptive Audio, Transparency mode and Personalized Spatial Audio.',
    price: 24999, originalPrice: 26900, discount: 7,
    thumbnail: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800'],
    stock: 75, isFeatured: true, isNewArrival: false,
    specs: new Map([['type','In-ear'],['chip','H2'],['battery','6 hrs (30 hrs with case)'],['anc','Yes'],['water_resistance','IPX4']]),
    tags: ['apple', 'airpods', 'earbuds', 'ios']
  },
  {
    name: 'JBL Flip 6', brand: 'JBL', category: 'audio',
    description: 'Portable waterproof speaker with bold JBL Original Pro Sound.',
    price: 9999, originalPrice: 11999, discount: 17,
    thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
    stock: 90, isFeatured: false, isNewArrival: false,
    specs: new Map([['type','Portable Speaker'],['connectivity','Bluetooth 5.1'],['battery','12 hrs'],['waterproof','IP67'],['output','30W']]),
    tags: ['jbl', 'speaker', 'portable', 'waterproof']
  },

  // ── CAMERAS ──
  {
    name: 'Sony Alpha A7 IV', brand: 'Sony', category: 'cameras',
    description: 'Full-frame mirrorless camera with 33MP sensor and 4K 60fps video.',
    price: 219999, originalPrice: 239999, discount: 8,
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
    stock: 10, isFeatured: true, isNewArrival: false,
    specs: new Map([['sensor','33MP Full-frame BSI CMOS'],['video','4K 60fps'],['autofocus','759-point phase detection'],['stabilization','5-axis IBIS'],['mount','Sony E-mount']]),
    tags: ['sony', 'camera', 'mirrorless', 'fullframe', 'professional']
  },
  {
    name: 'Canon EOS R50', brand: 'Canon', category: 'cameras',
    description: 'Compact mirrorless camera perfect for content creators and beginners.',
    price: 64999, originalPrice: 74999, discount: 13,
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
    stock: 25, isFeatured: false, isNewArrival: true,
    specs: new Map([['sensor','24.2MP APS-C CMOS'],['video','4K 30fps'],['autofocus','Dual Pixel CMOS AF II'],['weight','375g'],['mount','Canon RF-S']]),
    tags: ['canon', 'camera', 'mirrorless', 'beginner', 'content creator']
  },

  // ── TABLETS ──
  {
    name: 'iPad Air M2', brand: 'Apple', category: 'tablets',
    description: 'Supercharged by M2 chip with 11-inch Liquid Retina display.',
    price: 59999, originalPrice: 64999, discount: 8,
    thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
    stock: 30, isFeatured: true, isNewArrival: true,
    specs: new Map([['chip','Apple M2'],['display','11 inch Liquid Retina'],['storage','128GB'],['camera','12MP'],['battery','10 hrs'],['os','iPadOS 17']]),
    tags: ['apple', 'ipad', 'tablet', 'm2']
  },
  {
    name: 'Samsung Galaxy Tab S9', brand: 'Samsung', category: 'tablets',
    description: 'Android tablet with AMOLED display, S Pen included and IP68 water resistance.',
    price: 72999, originalPrice: 79999, discount: 9,
    thumbnail: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=400',
    images: ['https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800'],
    stock: 22, isFeatured: false, isNewArrival: true,
    specs: new Map([['processor','Snapdragon 8 Gen 2'],['display','11 inch Dynamic AMOLED'],['ram','8GB'],['storage','128GB'],['s_pen','Included'],['water_resistance','IP68']]),
    tags: ['samsung', 'tablet', 'android', 's pen', 'amoled']
  },

  // ── ACCESSORIES ──
  {
    name: 'Apple Watch Series 9', brand: 'Apple', category: 'accessories',
    description: 'Smartwatch with S9 chip, Double Tap gesture and Always-On Retina display.',
    price: 41999, originalPrice: 45900, discount: 9,
    thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
    stock: 45, isFeatured: true, isNewArrival: true,
    specs: new Map([['chip','S9 SiP'],['display','Always-On Retina LTPO'],['water_resistance','WR50'],['battery','18 hrs'],['health','ECG, Blood Oxygen, Temperature']]),
    tags: ['apple', 'watch', 'smartwatch', 'wearable']
  },
  {
    name: 'Logitech MX Master 3S', brand: 'Logitech', category: 'accessories',
    description: 'Advanced wireless mouse with MagSpeed scroll, 8000 DPI and USB-C.',
    price: 9995, originalPrice: 11999, discount: 17,
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'],
    stock: 80, isFeatured: false, isNewArrival: false,
    specs: new Map([['connectivity','Bluetooth + USB Receiver'],['dpi','200-8000'],['battery','70 days'],['buttons','7 programmable'],['scroll','MagSpeed electromagnetic']]),
    tags: ['logitech', 'mouse', 'wireless', 'productivity']
  },

  // ── TELEVISIONS ──
  {
    name: 'LG OLED C3 55"', brand: 'LG', category: 'televisions',
    description: 'Self-lit OLED pixels, perfect blacks, α9 AI Processor Gen6 and Dolby Vision.',
    price: 129999, originalPrice: 159999, discount: 19,
    thumbnail: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=800'],
    stock: 12, isFeatured: true, isNewArrival: false,
    specs: new Map([['size','55 inch'],['panel','OLED evo'],['resolution','4K UHD'],['refresh_rate','120Hz'],['hdr','Dolby Vision, HDR10'],['smart_tv','webOS 23']]),
    tags: ['lg', 'oled', 'television', '4k', 'smart tv']
  },
  {
    name: 'Samsung 65" Neo QLED 4K', brand: 'Samsung', category: 'televisions',
    description: 'Mini LED technology with Quantum Matrix and Neural Quantum Processor 4K.',
    price: 139999, originalPrice: 169999, discount: 18,
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
    images: ['https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800'],
    stock: 8, isFeatured: false, isNewArrival: true,
    specs: new Map([['size','65 inch'],['panel','Neo QLED Mini LED'],['resolution','4K UHD'],['refresh_rate','120Hz'],['hdr','HDR10+, Dolby Atmos'],['smart_tv','Tizen OS']]),
    tags: ['samsung', 'qled', 'television', '4k', 'mini led']
  },
  {
    name: 'Realme 55" Smart TV 4K', brand: 'Realme', category: 'televisions',
    description: 'Budget 4K Smart TV with Dolby Audio, 60Hz refresh and Android TV.',
    price: 32999, originalPrice: 39999, discount: 18,
    thumbnail: 'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=400',
    images: ['https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800'],
    stock: 30, isFeatured: false, isNewArrival: false,
    specs: new Map([['size','55 inch'],['resolution','4K UHD'],['refresh_rate','60Hz'],['audio','Dolby Audio 24W'],['smart_tv','Android TV 11']]),
    tags: ['realme', 'television', '4k', 'budget', 'android tv']
  },
  {
    name: 'boAt Rockerz 550', brand: 'boAt', category: 'audio',
    description: 'Budget over-ear headphones with 20-hour playtime and powerful bass.',
    price: 1499, originalPrice: 2999, discount: 50,
    thumbnail: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'],
    stock: 200, isFeatured: false, isNewArrival: false,
    specs: new Map([['type','Over-ear'],['connectivity','Bluetooth 5.0'],['battery','20 hrs'],['driver','40mm'],['mic','Yes']]),
    tags: ['boat', 'headphones', 'budget', 'bass', 'wireless']
  }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
  process.exit();
};

seed();