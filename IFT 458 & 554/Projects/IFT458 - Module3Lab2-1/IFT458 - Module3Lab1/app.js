const express = require("express");
const dotenv = require("dotenv");
const loanRoutes = require("./routes/loanRoutes");

dotenv.config({ path: "./config.env" });

const app = express();

app.use(express.json());

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
