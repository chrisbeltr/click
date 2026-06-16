let http = require("node:http");
let express = require("express");

let PORT = 3002;

let app = express();
app.use("/assets", express.static("assets"));

let server = http.createServer(app);
server.listen(PORT);
server.on("error", (err) => {
  if (err.code == "EADDRINUSE") {
    PORT++;
    server.listen(PORT);
  } else {
    console.log(err);
  }
});
server.on("listening", () => console.log(`listening on port ${PORT}`));
