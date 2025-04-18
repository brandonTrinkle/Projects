const https = require('https');
const fs = require('fs');

// Required for Node to read .env file
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// required for communicating and connecting to the database
// and perform CRUD operations
const mongoose = require('mongoose');

// required for the application to run
const app = require('./app');

// Connect to the database and replace the password
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// Connect to the database
console.log(DB); // check the database connection string
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    //useCreateIndex: true,
    //useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection successful!')
  })
  .catch(err => {
    console.log('DB connection failed!');
    console.log(err); 
  });
 
// Brandon Trinkle
// ASU ID: 1217455031
// IFT 458
// Create a HTTPS server
  const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
  };
// Change listenr to have options
const port = process.env.PORT || 3000;
const server = https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server is running on port ${port}...`);
  console.log(`Try: https://localhost:${port}`);
});