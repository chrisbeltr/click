const express = require("express");
const https = require("node:https");
const fs = require("node:fs");
const base62 = require("base62/lib/ascii");
const crypto = require("crypto");
const RE2 = require("re2");
const Firestore = require("@google-cloud/firestore");

let PORT = 443;

const db = new Firestore({
  projectId: process.env.CLICK_PID,
  keyFilename: "key.json",
});

const click = db.collection("click");

async function get(id) {
  return await db.collection("links").doc(id).get();
}

const link_reg = new RE2(
  "https?:\/\/(((www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,})|([0-9]{1,4}(\.[0-9]{1,4}){3}))(:[0-9]{1,5})?(\/[-a-zA-Z0-9@%_+~#?&\/= ]*)*",
);

let app = express();
app.set("case sensitive routing", true);

app.get("/", (req, res) => {
  res.sendFile("/index.html", { root: "." });
});

app.post("/:input", async (req, res, next) => {
  let len = 6;
  const hashed = () =>
    base62
      .encode(
        parseInt(
          crypto
            .createHash("md5")
            .update(req.params.input + crypto.randomUUID(), "utf8")
            .digest("hex"),
          16,
        ),
      )
      .slice(0, len);
  let d;
  while ((d = await get(hashed())).exists != false) len++;
  if (link_reg.test(decodeURIComponent(req.params.input)))
    d.ref.create({ type: "link", link: req.params.input });
  else d.ref.create({ type: "text", text: req.params.input });
  res.send(`https://borks.click/${d.id}`);
});

app.get("/:id", async (req, res, next) => {
  let d;
  if (
    req.params.id.length < 6 ||
    (d = await get(req.params.id)).exists == false
  ) {
    let err = new Error();
    err.code = "INVALID";
    next(err);
    return;
  }
  let type = d.get("type");
  if (type == "link") {
    res.redirect(302, d.get("link"));
    console.log("link!!");
  } else if (type == "text")
    res.set("Content-Type", "text/plain").status(200).send(d.get("text"));
});

app.use("/:id", (err, req, res, next) => {
  if (err.code == "INVALID")
    res.status(404).send(`invalid id ${req.params.id}`);
  else {
    res.status(500).send("something went wrong");
    console.log(err);
  }
});

// function retry(err) {
//   if (err && err.code == "EADDRINUSE") {
//     PORT++;
//     app.listen(PORT, retry);
//   } else {
//   }
// }
const cert = {
  key: fs.readFileSync("cert/private.key.pem"),
  cert: fs.readFileSync("cert/domain.cert.pem"),
};
let server = https.createServer(cert, app);
server.listen(PORT);
server.on("error", (err) => {
  if (err.code == "EADDRINUSE") {
    PORT++;
    server.listen(PORT);
  } else {
    console.log(err);
  }
});
server.on("listening", () =>
  console.log(`wistening at https://borks.click:${PORT}`),
);
