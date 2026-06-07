const express = require("express");
const http = require("node:http");
const fs = require("node:fs");
const base62 = require("base62/lib/ascii");
const crypto = require("crypto");
const RE2 = require("re2");
const escape = require("escape-html");
const Firestore = require("@google-cloud/firestore");

let PORT = 3000;

const db = new Firestore({
  projectId: process.env.CLICK_PID,
  keyFilename: "key.json",
});

const click = db.collection("click");

async function get(id) {
  return await db.collection("links").doc(id).get();
}

const link_reg = new RE2(
  "^https?:\/\/(((www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,})|([0-9]{1,3}(\.[0-9]{1,3}){3}))(:[0-9]{1,5})?(\/[-a-zA-Z0-9@%_+~#?&\/= ]*)*$",
);

let app = express();
app.set("case sensitive routing", true);

app.get("/", (req, res) => {
  res.sendFile("/index.html", { root: "." });
});

app.post("/:input", async (req, res, next) => {
  if (req.params.input.length > 2000) {
    res.status(400).send("input was too large!");
    return;
  }
  let input = decodeURIComponent(req.params.input);
  let escaped = escape(input);
  let len = 6;
  const hashed = () =>
    base62
      .encode(
        parseInt(
          crypto
            .createHash("md5")
            .update(input + crypto.randomUUID(), "utf8")
            .digest("hex"),
          16,
        ),
      )
      .slice(0, len);
  let d;
  while ((d = await get(hashed())).exists != false) len++;
  if (link_reg.test(decodeURIComponent(input)))
    d.ref.create({ type: "link", link: input });
  else d.ref.create({ type: "text", text: input });
  res
    .set("Content-Type", "text/plain")
    .status(200)
    .send(`https://borks.click/${d.id}`);
});

app.get("/:id", async (req, res, next) => {
  let id = escape(req.params.id);
  let d;
  if (id.length < 6 || (d = await get(id)).exists == false) {
    let err = new Error();
    err.code = "INVALID";
    next(err);
    return;
  }
  let type = d.get("type");
  if (type == "link") {
    res.redirect(302, d.get("link"));
  } else if (type == "text")
    res.set("Content-Type", "text/plain").status(200).send(d.get("text"));
});

app.use("/:id", (err, req, res, next) => {
  let id = escape(req.params.id);
  if (err.code == "INVALID") res.status(404).send(`invalid id ${id}`);
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
// const cert = {
//   key: fs.readFileSync("cert/private.key.pem"),
//   cert: fs.readFileSync("cert/domain.cert.pem"),
// };
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
