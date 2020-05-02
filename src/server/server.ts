import express from "express";
import * as http from "http";
import socketio from "socket.io";
import { Util } from "../util";
import { WebUIPlayer } from "./player/webui";
import { Player } from "./player";
import { WeightingAI } from "./player/weighting";
import { Match } from "./match";

const app = express();
const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app);
export const io = socketio(server);

app.use(express.static("docs"));

app.set("port", PORT);

let matchQueue: Player[] = [];

io.on("connection", (s) => {
  const addr = s.handshake.address;
  Util.log(`[connection] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);

  let player: Player | undefined;
  let match: Match | undefined;
  s.on("match", (res: { name: string, enemy: string }) => {
    Util.log(`[match] from: ${res.name}`);
    player = new WebUIPlayer(res.name, s)
    switch (res.enemy) {
      case "AI":
        // onMatch(player,new RandomAIPlayer());
        // new Match(player, new SimpleAI(10));
        match = new Match(player, new WeightingAI(6));
        break;
      case "Human":
        // matchQueue.push(player);
        // io.sockets.emit("updateWaiting", {
        //   queue: matchQueue
        //     .filter((p) => p?.isConnected())
        //     .map((p) => { return { name: p.name, id: p.id } })
        // });
        // matchQueue = matchQueue.filter((p) => p?.isConnected());
        const enemy = matchQueue.shift();
        if (enemy?.isWaiting()) {
          match = new Match(player, enemy);
        } else {
          matchQueue.push(player);
        }
        break;
      default:
        console.error(`Match Error: Unknown type of player: ${res.enemy}`)
    }
  })

  // s.on("matchRequest", (res) => {
    
  // })

  s.on("watch", (res) => {
    const match = Match.find(res.id);
    if (match === null) {
      // ??
      return;
    }
    match.watch(s);
  })

  s.on("disconnect", () => {
    Util.log(`[disconnect] total: ${s.client.conn.server.clientsCount}, from: ${addr}, id: ${s.id}`);
    match?.onExit();
  })
})

const roomlist = io.of("roomlist");
roomlist.on("connection", (s) => {
  let request: NodeJS.Timeout;
  s.on("request", (res) => { 
    const f = () => {
      s.emit("update", { roomList: Match.list.map((m) => m.getInfo()) })
    };
    request = setInterval(f, res?.interval ?? 5000);
    f();
   })
  s.on("stop", () => {
    clearInterval(request);
  })
})

server.listen(PORT, () => {
  console.log(`Listening *:${PORT}`)
})
