// server.js

// Set up global punycode so that upstream dependencies use the userland version
global.punycode = require('punycode');

// Load environment variables early
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Import mongoose and configure strictQuery to suppress the warning
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Import your Express app
const app = require('./app');

// Define your MongoDB connection string (or use one from your environment variables)
const DB =
  process.env.DATABASE ||
  "mongodb+srv://btrinkle52:lVFgPGisucpwqBkn@trinklecluster.obqkf.mongodb.net/?retryWrites=true&w=majority&appName=TrinkleCluster";

console.log("Connecting to DB:", DB);

// Connect to the database, then start the server if successful
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful!');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`App running on port ${port}...`);
      console.log(`To test the IFT 458 REST App, visit: http://localhost:${port}...`);
    });
  })
  .catch(err => {
    console.error('DB connection failed!', err);
  });
