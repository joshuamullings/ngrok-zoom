import express from "express";
//import ngrok from "ngrok";
import ngrok from "@ngrok/ngrok";
import bodyParser from "body-parser";
import crypto from "crypto";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("dotenv").config();

const app = express();

const { NGROK_AUTH_TOKEN, PORT, ZOOM_SECRET_TOKEN } = process.env;

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/hook", (req, res) => {
    console.log(JSON.stringify(req.headers, null, 4));
    console.log(JSON.stringify(req.body, null, 4));

    if (req.body.event === "endpoint.url_validation") {
        // Zoom validation hash
        const hashForValidate = crypto
            .createHmac("sha256", ZOOM_SECRET_TOKEN)
            .update(req.body.payload.plainToken)
            .digest("hex");

        // Pipedream response format
        res.header("Content-Type", "text/html; charset=utf-8");
        res.header("Connection", "keep-alive");
        res.header("X-Powered-By", "Express");
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Content-Length",
            JSON.stringify({
                plainToken: req.body.payload.plainToken,
                encryptedToken: hashForValidate,
            }).length
        );

        console.log(JSON.stringify(res.getHeaders(), null, 4));

        res.status(200).json({
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate,
        });
    }
});

app.listen(PORT, async () => {
    const listener = await ngrok.forward({ addr: PORT, authtoken_from_env: true });
    console.log(`ngrok-oauth app running locally on http://localhost:${PORT}`);
    console.log(`ngrok tunnel running on ${listener.url()}`);
});
