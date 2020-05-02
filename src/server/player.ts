import { Board } from "../board";
import { State, MatchInfo } from "../util";
import * as uuid from "uuid";

export abstract class Player{
  name: string;
  enemy?: Player;
  color?: State;
  id: string;
  constructor(name: string) {
    this.id = uuid.v4();
    this.name = name;
  }
  abstract match(enemy: Player, info: MatchInfo, color:State): void;
  abstract async onMyTurn(info: MatchInfo, onPut: (x: number, y: number) => Promise<MatchInfo | null>, enemySkipped?: boolean): Promise<void>;
  
  isConnected(): boolean{
    return true;
  }
  isWaiting(): boolean{
    return false;
  }
  enemyDisconnected(): void {}
  skip(info: MatchInfo): void {};
  end(info: MatchInfo): void { };
  isMyColor(s: State): boolean{
    return this.color !== undefined && s === this.color;
  }
  equals(p:Player) {
    return this.id === p.id;
  }
}
