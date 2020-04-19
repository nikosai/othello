import { Board } from "./board";
import { State, Vec2 } from "./util";

export abstract class Player{
  name: string;
  enemy?: Player;
  color?: State;
  constructor(name: string) {
    this.name = name;
  }
  abstract match(enemy: Player, board: Board, color:State): void;
  abstract async onMyTurn(board: Board, onPut: (x: number, y: number) => Promise<Board | null>, enemySkipped?: boolean): Promise<void>;
  
  isConnected(): boolean{
    return true;
  }
  enemyDisconnected(): void {}
  skip(board: Board): void {};
  end(board: Board): void { };
  isMyColor(s: State): boolean{
    return this.color !== undefined && s === this.color;
  }
}
