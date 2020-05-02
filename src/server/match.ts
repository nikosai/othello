import { Board } from "../board";
import { Player } from "./player";
import * as uuid from "uuid";
import { Util, State } from "../util";

export class Match {
  static list: Match[] = [];
  board: Board;
  black: Player;
  white: Player;
  id: string;
  constructor(p1: Player, p2: Player) {
    this.id = uuid.v4();
    this.board = new Board();
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
            player.onMyTurn(this.board, playerOnPut, true);
            return this.board;
          }
        } else {
          enemy.onMyTurn(this.board, enemyOnPut);
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

    this.black.onMyTurn(this.board, onPuts.black);
    Match.list.push(this);
  }

  equals(m:Match) {
    return m.id === this.id
  }

  onExit() {
    Match.list = Match.list.filter((m)=>!this.equals(m));
    this.black.enemyDisconnected();
    this.white.enemyDisconnected();
  }
}
