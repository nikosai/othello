import { NegaAlphaAIPlayer } from "./negaalpha";
import { Util } from "../util";

export class SimpleAI extends NegaAlphaAIPlayer{
  constructor(depth:number) {
    super((board) => {
      return board.count(board.curState) - board.count(Util.reverse(board.curState));
    },depth)
  }
}
