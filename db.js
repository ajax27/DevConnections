const dotenv = require("dotenv");
dotenv.config();
const mongodb = require("mongodb");

mongodb.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    module.exports = client;
    const app = require("./app");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => `App listening on port: ${PORT}`);
  }
);
