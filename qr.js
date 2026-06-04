const express = require("express");
const http = require("node:http");
const qr = require("qrcode");

let PORT = 3001;

let app = express();
app.set("case sensitive routing", true);

app.get("/", (req, res) => {
  res
    .type("text/plain")
    .status(200)
    .end("shiiiiiiiiiiii we're fucking doneeeeeeeee");
});

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
