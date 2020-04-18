import express from "express";
import * as http from "http";
import socketio from "socket.io";
import { Util } from "../util";

const app = express();
const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app)
const io = socketio(server);

app.use(express.static("docs"));

app.set("port", PORT);

io.on("connection", (s) => {
  const addr = s.handshake.address;
  Util.log(`[connection] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
  s.on("disconnect", () => {
    Util.log(`[disconnect] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
  }) 
})

server.listen(PORT, () => {
  http.get("http://localhost:4000/__browser_sync__?method=reload")
    .on("error", (_) => {})
  console.log(`Listening *:${PORT}`)
})
