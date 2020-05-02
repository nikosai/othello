import { Board } from "../board";
import { Player } from "./player";
import * as uuid from "uuid";
import { Util, State, MatchInfo } from "../util";
import { Socket, Namespace } from "socket.io";
import { io } from "./server";

export class Match {
  static list: Match[] = [];
  board: Board;
  black: Player;
  white: Player;
  id: string;
  room: Namespace;
  constructor(p1: Player, p2: Player) {
    this.id = uuid.v4();
    this.board = new Board();
    this.room = io.of("watch").to(this.id);
    if (Math.floor(Math.random() * 2) === 0) {
      this.black = p1;
      this.white = p2;
    } else {
      this.black = p2;
      this.white = p1;
    }
    Util.log(`[Start] ${this.black.name} vs ${this.white.name}`)

    this.black.match(this.white, this.board, State.Black);
    this.white.match(this.black, this.board, State.White);

    const onPutMaker = (player: Player, enemy: Player, playerOnPut: (x: number, y: number) => Promise<Board | null>, enemyOnPut: (x: number, y: number) => Promise<Board | null>) => async (x: number, y: number) => {
      const newboard = this.board.put(x, y);
      if (newboard) {
        Util.log(`[put] name:${player.name}, x:${x}, y:${y}`);
        this.board = newboard;
        Util.log(`[Candidates] ${this.board.getCandidates().length}`)
        const res = this.board.checkSkipped();
        if (res) {
          this.board = res;
          if (res.checkSkipped()) {
            player.end(this.board);
            enemy.end(this.board);
            return this.board;
          } else {
            this.room.emit("turn", { board: this.board, enemySkipped: true, });
            this.onTurn(player, playerOnPut, true);
            return this.board;
          }
        } else {
          this.room.emit("turn", { board: this.board });
          this.onTurn(enemy, enemyOnPut);
          return this.board;
        }
      } else {
        return null;
      }
    };

    const onPuts = {
      black: async (x: number, y: number) => {
        return onPutMaker(this.black, this.white, onPuts.black, onPuts.white)(x, y);
      },
      white: async (x: number, y: number) => {
        return onPutMaker(this.white, this.black, onPuts.white, onPuts.black)(x, y);
      }
    }

    this.onTurn(this.black, onPuts.black);
    Match.list.push(this);
  }

  onTurn(p: Player, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean) {
    this.room.emit("turn", {
      board: this.board.getBoard(), color: p.color, enemySkipped: enemySkipped ?? false
    });
    p.onMyTurn(this.board, onPut, enemySkipped);
  }

  equals(m:Match|string) {
    if (m instanceof Match) return m.id === this.id
    else return m === this.id;
  }

  getInfo():MatchInfo{
    return new MatchInfo(this);
  }

  static find(id: string) {
    for (let m of Match.list) {
      if (m.equals(id)) return m;
    }
    return null;
  }

  watch(s: Socket) {
    s.join(this.id);
  }

  onExit() {
    Match.list = Match.list.filter((m)=>!this.equals(m));
    this.black.enemyDisconnected();
    this.white.enemyDisconnected();
    this.room.emit("matchDisconnected");
    this.room.clients((e:any, socketids:string[]) => {
      socketids.forEach((id) => { io.sockets.sockets[id].leave(this.id) });
    })
  }
}
