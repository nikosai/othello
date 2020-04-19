import { NegaAlphaAIPlayer } from "./negaalpha";
import { Util, State } from "../util";

// https://ukyo.sakura.ne.jp/othello/5-1.html
const weights = [
  [30],
  [-12, -15],
  [0, -3, 0],
  [-1, -3, -1, -1]
];

export class WeightingAI extends NegaAlphaAIPlayer{
  constructor(depth:number) {
    super((board) => {
      let v = 0;
      for (let x = 0; x < board.width; x++){
        for (let y = 0; y < board.height; y++){
          const x1 = (x > 3 ? 7 - x : x);
          const y1 = (y > 3 ? 7 - y : y);
          if (board.get(x, y) !== State.Empty)
            v += (board.get(x, y) === board.curState ? 1 : 0) * weights[Math.max(x1, y1)][Math.min(x1, y1)];
        }
      }
      return v;
    }, depth, "WeightingAI");
  }
}
