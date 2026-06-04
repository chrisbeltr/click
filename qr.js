const express = require("express");
const http = require("node:http");
const qr = require("qrcode");

let PORT = 3001;

let app = express();
app.set("case sensitive routing", true);

app.get("/", (req, res) => {
  res.redirect("https://borks.click");
});

app.get("/:id", (req, res) => {
  let code = qr.toString(
    `https://borks.click/${req.params.id}`,
    {
      type: "utf8",
    },
    (err, code) => {
      res.type("text/plain").send(code);
    },
  );
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
