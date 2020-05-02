import { Util, Box, Vec2, State, RawBoard, MatchInfo } from "../util";
import { Board } from "../board";
const FRAMERATE = 60;

const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
export class BoardCanvas{
  line_width: number = 0.005;
  square_size: Box;
  cxt: CanvasRenderingContext2D;
  mouse_at: Vec2 | null = null;
  board: Board;
  myState: State;
  update: NodeJS.Timeout;
  onPut: ((x: number, y: number) => void) | null;
  constructor(info:MatchInfo, myState: State, onPut?:(x: number, y: number) => void) {
    this.board = new Board(info.board, info.turn);
    this.myState = myState;
    this.onPut = onPut ?? null;
    this.cxt = Util.checkIsDefined(canvas.getContext('2d'));
    this.square_size = new Box(
      (1 - this.line_width * (this.board.width + 1)) / this.board.width,
      (1 - this.line_width * (this.board.height + 1)) / this.board.height
    );
    const listenerMaker = (f:(x:number,y:number)=>void) => (e:MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - Math.floor(rect.left);
      const y = e.clientY - Math.floor(rect.top);
      const i = Math.floor(x / canvas.width * window.devicePixelRatio * this.board.width);
      const j = Math.floor(y / canvas.height * window.devicePixelRatio * this.board.height);
      f(i, j);
    }

    document.addEventListener('click', listenerMaker((x,y)=>this.onClick(x,y)));
    document.addEventListener('mousemove', listenerMaker((x, y) => this.onMouseMove(x, y)));

    const leftState = this.myState === State.Empty ? State.Black : this.myState;
    document.getElementById("wrapper")!.style.display = "block";
    document.getElementById("my-color")!.className = leftState === State.Black ? "black stone" : "white stone";
    document.getElementById("enemy-color")!.className = leftState === State.Black ? "white stone" : "black stone";
    document.getElementById("my-name")!.innerText = leftState === State.Black ? info.black.name : info.white.name;
    document.getElementById("enemy-name")!.innerText = leftState === State.Black ? info.white.name : info.black.name;
    
    this.update = setInterval(() => {
      const canvasWrapper = document.getElementById("canvas-wrapper")!;
    
      // resize
      canvas.width = canvasWrapper.clientWidth * window.devicePixelRatio;
      canvas.height = canvasWrapper.clientHeight * window.devicePixelRatio;
    
      // update
      this.drawBoard();
    }, 1000 / FRAMERATE);
  }

  drawBoard() {
    const redOverlay = 'rgba(255,0,0,0.3)';
    const grayOverlay = 'rgba(0,0,0,0.2)';
    
    const leftState = this.myState === State.Empty ? State.Black : this.myState;
    document.getElementById("my-stones")!.innerText = this.board.count(leftState).toString();
    document.getElementById("enemy-stones")!.innerText = this.board.count(Util.reverse(leftState)).toString();
    document.getElementById("my-name")!.className = this.board.curState === leftState ? "turn playerName" : "playerName";
    document.getElementById("enemy-name")!.className = this.board.curState === Util.reverse(leftState) ? "turn playerName" : "playerName";
    
    let res: Vec2[] = [];
    if (this.myState === this.board.curState && this.mouse_at) {
      res = this.board.check(this.mouse_at.x, this.mouse_at.y);
    }

    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        this.fillSquare('green', x, y);
        const st = this.board.get(x, y);
        if (st !== State.Empty) {
          this.drawStone(
            (st === State.Black ? 'black' : 'white'),
            'black',
            0.003,
            0.8,
            x, y);
        }

        if (this.mouse_at) {
          if (this.mouse_at.equals(x, y)) {
            if (this.board.get(x, y) === State.Empty) {
              this.drawStone(
                (this.myState === State.Black ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'),
                'rgba(0,0,0,0.3)',
                0.003,
                0.65,
                x, y);
            }
            this.fillSquare((res.length > 0 ? redOverlay : grayOverlay), x, y);
          } else if (Vec2.in(res,x,y)) {
            this.fillSquare(redOverlay, x, y);
          }
        }
      }
    }
  }

  setInfo(info: MatchInfo) {
    this.board = new Board(info.board, info.turn);
  }

  fillSquare(fillStyle: string | CanvasGradient | CanvasPattern, x: number, y: number) {
    const left = this.line_width + (this.square_size.width + this.line_width) * x;
    const top = this.line_width + (this.square_size.height + this.line_width) * y;
    this.fillRectPercent(fillStyle, left, top, this.square_size.width, this.square_size.height);
  }

  drawStone(fillStyle: string | CanvasGradient | CanvasPattern, strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number, scale: number, x: number, y: number) {
    this.drawEllipseAtPercent(
      fillStyle,
      strokeStyle,
      lineWidth * (canvas.height + canvas.width) / 2,
      (2*x+1)/(2*this.board.width),
      (2*y+1)/(2*this.board.height),
      this.square_size.width * scale,
      this.square_size.height * scale
    );
  }

  onClick(x: number, y: number) {
    if (x >= 0 && x < this.board.width
      && y >= 0 && y < this.board.height
      && this.myState === this.board.curState
      && this.onPut !== null) {
      this.onPut(x, y);
    }
  }

  onMouseMove(x: number, y: number) {
    if (x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) {
      this.mouse_at = null;
    } else {
      this.mouse_at = new Vec2(x, y);
    }
  }

  fillRectPercent(fillStyle: string | CanvasGradient | CanvasPattern, x: number, y: number, w: number, h: number) {
    const t = this.cxt.fillStyle;
    this.cxt.fillStyle = fillStyle;
    this.cxt.fillRect(
      canvas.width * x,
      canvas.height * y,
      canvas.width * w,
      canvas.height * h);
    // if (fillStyle === 'rgba(255,0,0,0.5)') {
    //   console.log(t,this.cxt.fillStyle,
    //     this.elem.width * x,
    //     this.elem.height * y,
    //     this.elem.width * w,
    //     this.elem.height * h)
    // }
    this.cxt.fillStyle = t;
  }

  drawEllipseAtPercent(fillStyle: string | CanvasGradient | CanvasPattern, strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number, cx: number, cy: number, width: number, height: number) {
    const f = this.cxt.fillStyle;
    const s = this.cxt.strokeStyle;
    const l = this.cxt.lineWidth;
    this.cxt.fillStyle = fillStyle;
    this.cxt.strokeStyle = strokeStyle;
    this.cxt.lineWidth = lineWidth;
    this.drawEllipseAt(
      cx * canvas.width,
      cy * canvas.height,
      width * canvas.width,
      height * canvas.height
    );
    this.cxt.fillStyle = f;
    this.cxt.strokeStyle = s;
    this.cxt.lineWidth = l;
  }

  drawEllipseAt(cx: number, cy: number, width: number, height: number){
    const PI2 = Math.PI * 2;
    const ratio = height / width;
    const radius = width / 2;
    const increment = 1 / radius;

    this.cxt.beginPath();
    let x = cx + radius * Math.cos(0);
    let y = cy - ratio * radius * Math.sin(0);
    this.cxt.lineTo(x, y);

    for (let radians = increment; radians < PI2; radians += increment) {
      x = cx + radius * Math.cos(radians);
      y = cy - ratio * radius * Math.sin(radians);
      this.cxt.lineTo(x, y);
    }

    this.cxt.closePath();
    this.cxt.fill();
    this.cxt.stroke();
  }

  onExit() {
    document.getElementById("wrapper")!.style.display = "none";
    clearInterval(this.update);
  }
}
