const express = require("express");
const http = require("node:http");
const qr = require("qrcode");
const RE2 = require("re2");

let PORT = 3001;
let colors = {
  default: { dark: "#000000ff", light: "#ffffffff" },
  dark: { dark: "#000000ff", light: "#454647ff" },
  light: { dark: "#bbe4f9ff", light: "#ffffffff" },
  borks: { dark: "#ac6962ff", light: "#ffe482ff" },
  fall: { dark: "#450222ff", light: "#977bb7ff" },
};

const hex_regex = new RE2("^[0-9a-fA-F]{8}$");

let app = express();
app.set("case sensitive routing", true);

app.set("query parser", (str) => new URLSearchParams(str));

app.get("/", (req, res) => {
  if (req.host == "qr.brks.o") res.redirect("http://brks.o");
  else res.redirect("https://borks.click");
});

app.get("/:id", (req, res) => {
  let color = colors.default;
  let preset = req.query.get("preset");
  let dark = req.query.get("dark");
  let light = req.query.get("light");
  if (preset != null) {
    if (preset == "random") {
      let cs = Object.values(colors);
      color = cs[Math.floor(Math.random() * cs.length)];
    } else {
      let c = colors[preset];
      if (c != undefined) {
        color = c;
      }
    }
  } else if (hex_regex.test(light) && hex_regex.test(dark)) {
    color = { dark: `#${dark}`, light: `#${light}` };
  }
  let prefer = req.get("Prefer");
  if (prefer && prefer.includes("terminal")) {
    res.type("text/plain");
    qr.toString(
      `${req.host == "qr.borks.click" ? "https" : "http"}://${req.host.replace("qr.", "")}/${req.params.id}`,
      {
        margin: 1,
        small: true,
        type: "terminal",
      },
      (err, code) => {
        res.send(code);
      },
    );
  } else {
    res.type("image/png");
    qr.toFileStream(
      res,
      `${req.host == "qr.borks.click" ? "https" : "http"}://${req.host.replace("qr.", "")}/${req.params.id}`,
      {
        scale: 12,
        color: color,
        margin: 1,
      },
    );
  }
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
