const express = require("express");
require("@dotenvx/dotenvx").config({ path: `.env.${process.env.MODE}` });
const cors = require("cors");
const expressws = require("express-ws");
require("colors");

const app = express();

app.use(express.json({ extended: false }));
app.use(
  cors({ origin: ["https://db.aayushparmar.com", "http://localhost:3039"] })
);
expressws(app);
app.use("/api", (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const status = res.statusCode;
    const statusColor =
      status >= 200 && status < 300
        ? status.toString().green
        : status.toString().red;
    const responseTime = Date.now() - start;

    console.log(
      `${req.method.yellow} ${req.path.cyan} ${statusColor} | ${
        req.ip.magenta
      } | ${responseTime.toString().blue} ms`
    );
  });

  next();
});
app.use("/api", require("./routes/routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
