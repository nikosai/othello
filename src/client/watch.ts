import { MatchInfo, State, Util } from "../util";
import { watch } from "./main";
import { BoardCanvas } from "./canvas";

export function initWatch() {
  let canvas: BoardCanvas | null = null;
  
  watch.on("init", (res: { info: MatchInfo }) => {
    canvas = new BoardCanvas(res.info, State.Empty);
  })
  watch.on("turn", (res: { info: MatchInfo }) => {
    canvas?.setInfo(res.info);
  })
  watch.on("end", (res: { info: MatchInfo }) => {
    canvas?.setInfo(res.info);
    let winner: { name: string, count: number } | null = null;
    const d = res.info.black.count - res.info.white.count;
    if (d > 0) winner = res.info.black;
    else if (d < 0) winner = res.info.white;
    let str = "";
    if (winner === null) {
      str = "引き分けです"
    } else {
      str = `${winner.name}さんの${Util.calcResult(Math.abs(d))}です`
    }
    M.toast({html:`試合終了！ ${str}`})
  })
  watch.on("matchDisconnected", () => {
    canvas?.onExit();
    canvas = null;
  })
}
