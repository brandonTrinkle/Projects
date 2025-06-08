import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { WebSocketContext, socket, setupWebSocket } from './webSocketService.js';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import NewAccount from './pages/NewAccount';
import Profile from './pages/Profile';
import Header from './Components/Header';
import PrivateRoute from './Components/PrivateRoute';
import Footer from './Components/Footer';

export default function App() {
    const [databaseUpdates, setDatabaseUpdates] = useState([]);
    const [stockPrice, setStockPrice] = useState(null);
    const [portfolio, setPortfolio] = useState(null);

    useEffect(() => {
        // Listen for all database updates
        setupWebSocket((change) => {
            setDatabaseUpdates((prevUpdates) => [...prevUpdates, change]);

            // **Extract and process updates**
            if (change.operationType === 'update' || change.operationType === 'insert') {
                const collectionName = change.ns.coll;

                // **Check if update is related to stocks**
                if (collectionName === 'stocks') {
                    const newStockPrice = change.fullDocument?.price || null;
                    if (newStockPrice) {
                        setStockPrice(newStockPrice.toFixed(2));
                    }
                }

                // **Check if update is related to portfolio**
                if (collectionName === 'portfolios') {
                    setPortfolio(change.fullDocument);
                }
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ databaseUpdates, stockPrice, portfolio, socket }}>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/SignIn" element={<SignIn />} />
                    <Route path="/NewAccount" element={<NewAccount />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/Profile" element={<Profile />} />
                    </Route>
                </Routes>
                <Footer />
            </BrowserRouter>
        </WebSocketContext.Provider>
    );
}