import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Portfolio from './Models/portfolio.model.js';
import userRoutes from './Routes/user.route.js';
import authRoutes from './Routes/auth.route.js';
import seedRoutes from './Routes/seed.route.js';
import portfolioRoutes from './Routes/portfolio.route.js';
import tradeRoutes from './Routes/trade.route.js';
import { checkOrCreatePortfolioMiddleware } from './services/portfolio.service.js';
import { updateStockPrices } from './seed/updateStocks.js';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import historyRoutes from './Routes/history.route.js';
import { Server } from 'socket.io';
import http from 'http';

// **Set up directory name correctly**
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log('Starting server...');

// **Create Express app**
const app = express();
const server = http.createServer(app); // Create an HTTP server (important for WebSockets)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// **Connect to MongoDB**
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;

// **Handle MongoDB connection error**
db.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

// **Wait for MongoDB to connect before starting the server**
db.once('open', async () => {
    console.log('Connected to MongoDB');

    const allPortfolios = await Portfolio.find({});
    console.log('All portfolios at startup:', allPortfolios.map(p => ({
        userId: p.userId,
        availableFunds: p.availableFunds,
        portfolioId: p._id
    })));

    // **Middleware**
    app.use(cors());
    app.use(express.json());
    app.use(['/backend/user/profile', '/backend/portfolio'], checkOrCreatePortfolioMiddleware);

    // **API Routes**
    app.use('/backend/user', userRoutes);
    app.use('/backend/auth', authRoutes);
    app.use('/backend/stocks', seedRoutes);
    app.use('/backend/trade', tradeRoutes);
    app.use('/backend/history', historyRoutes);
    app.use('/backend/portfolio', portfolioRoutes);

    // **Frontend Serving (React)**
    app.use(express.static(path.join(__dirname, './client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, './client/dist/index.html'));
    });

    // **WebSocket Handling**
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // **Send real-time stock updates every 2 seconds**
        const stockInterval = setInterval(() => {
            const stockData = { price: Math.random() * 100, time: new Date().toISOString() };
            socket.emit('stockUpdate', stockData);
        }, 2000);

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
            clearInterval(stockInterval); // Stop sending stock updates when client disconnects
        });
    });

    // **MongoDB Change Stream to Listen for Any Database Updates**
    const changeStream = db.watch();

    changeStream.on('change', (change) => {
        console.log('Database Change Detected:', change);
        
        // Broadcast the change to all connected clients
        io.emit('databaseUpdate', change);
    });

    // **Error Handling Middleware**
    app.use((err, req, res, next) => {
        console.error('Server Error:', err.stack);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal Server Error',
        });
    });

    // **Start the Server**
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    // **Schedule Stock Price Updates**
    cron.schedule('* * * * *', async () => {
        console.log('Fetching latest stock prices...');
        await updateStockPrices();
    });
});