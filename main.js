const express = require("express");
const https = require("node:https");
const fs = require("node:fs");
const base62 = require("base62/lib/ascii");
const crypto = require("crypto");
const Firestore = require("@google-cloud/firestore");

let PORT = 443;

const db = new Firestore({
  projectId: "cummy-bot",
  keyFilename: "key.json",
});

const click = db.collection("click");

async function get(id) {
  return await db.collection("test").doc(id).get();
}

let app = express();
app.set("case sensitive routing", true);

app.get("/", (req, res) => {
  res.sendFile("/index.html", { root: "." });
});

app.post("/:link", async (req, res, next) => {
  let len = 6;
  const hashed = () =>
    base62
      .encode(
        parseInt(
          crypto
            .createHash("md5")
            .update(req.params.link + crypto.randomUUID(), "utf8")
            .digest("hex"),
          16,
        ),
      )
      .slice(0, len);
  let d;
  while ((d = await get(hashed())).exists != false) len++;
  d.ref.create({ type: "link", link: req.params.link });
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
  res.redirect(302, d.get("link"));
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
