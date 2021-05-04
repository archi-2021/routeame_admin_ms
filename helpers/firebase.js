const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});