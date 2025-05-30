const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
