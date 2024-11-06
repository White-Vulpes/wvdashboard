const express = require("express");
require("@dotenvx/dotenvx").config();
const cors = require("cors");
const expressws = require("express-ws");

const app = express();

app.use(express.json({ extended: false }));
app.use(
  cors({ origin: ["https://aayushparmar.com", "http://localhost:3039"] })
);
expressws(app);
app.use("/api", require("./routes/routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
