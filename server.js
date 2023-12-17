const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
};

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.post("/register", checkJwt, (req, res) => {
  // Hier können Sie die Registrierungslogik implementieren
  res.send("Registrierung erfolgreich");
});

app.post("/login", checkJwt, (req, res) => {
  // Hier können Sie die Anmelde-Logik implementieren
  res.send("Anmeldung erfolgreich");
});

app.listen(3000, () => console.log("API is running on http://localhost:3000"));
