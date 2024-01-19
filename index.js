import express from "express";
import ngrok from "ngrok";
import bodyParser from "body-parser";
import crypto from "crypto";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("dotenv").config();

const app = express();

const { NGROK_AUTH_TOKEN, PORT } = process.env;

app.use(bodyParser.json());

app.post("/hook", (req, res) => {
    console.log(JSON.stringify(req.headers, null, 4));
    console.log(JSON.stringify(req.body, null, 4));

    if (req.body.event === "endpoint.url_validation") {
        const hashForValidate = crypto
            .createHmac("sha256", "iKaJiIqpQDmUpqOyPwsOfQ")
            .update(req.body.payload.plainToken)
            .digest("hex");

        res.header("Content-Type", "text/html; charset=utf-8");

        res.status(200).json({
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate,
        });
    }
});

app.listen(PORT, async () => {
    await ngrok.authtoken(NGROK_AUTH_TOKEN);
    const url = await ngrok.connect(PORT);
    console.log(`ngrok-oauth app running locally on http://localhost:${PORT}`);
    console.log(`ngrok tunnel running on ${url}`);
});
