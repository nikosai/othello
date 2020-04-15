import express from "express";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.static("docs"));

app.listen(80, () => {
  console.log("Listening *:80")
})
