import { Board } from "./board";
import { State } from "./util";

export abstract class Player{
  name: string;
  enemy?: Player;
  color?: State;
  constructor(name: string) {
    this.name = name;
  }
  abstract match(enemy: Player, board: Board, color:State): void;
  abstract isConnected(): boolean;
  abstract enemyDisconnected(): void;
  abstract onMyTurn(board: Board, onPut: (x: number, y: number) => Board | null): void;
  abstract end(board:Board):void;
}
