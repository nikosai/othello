import { MatchInfo } from "../util";
import { watch } from "./main";

export function initWatch() {
  watch.on("turn", (m: { info: MatchInfo }) => {
    console.log(m.info);
  })
}
