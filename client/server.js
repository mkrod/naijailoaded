import { createServer } from "https";
import { readFileSync } from "fs";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = 5190;

const httpsOptions = {
  key: readFileSync("./keys/localhost+1-key.pem"),   // your key file
  cert: readFileSync("./keys/localhost+1.pem"),  // your cert file
};

app.prepare()
  .then(() => {
    createServer(httpsOptions, (req, res) => handle(req, res))
      .listen(PORT, "0.0.0.0", () => console.log("> HTTPS running on https://localhost:5190"));
  });
