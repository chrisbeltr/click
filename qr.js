const express = require("express");
const http = require("node:http");
const qr = require("qrcode");

let PORT = 3001;
let colors = [
  { dark: "#000000ff", light: "#454647ff" },
  { dark: "#ac6962ff", light: "#ffe482ff" },
  { dark: "#450222ff", light: "#977bb7ff" },
  { dark: "#bbe4f9ff", light: "#ffffffff" },
];

let app = express();
app.set("case sensitive routing", true);

app.get("/", (req, res) => {
  res.redirect("https://borks.click");
});

app.get("/:id", (req, res) => {
  res.type("image/png");
  qr.toFileStream(res, `https://borks.click/${req.params.id}`, {
    scale: 12,
    color: colors[Math.floor(Math.random() * colors.length)],
    margin: 1,
  });
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
