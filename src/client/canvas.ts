import { Board } from "../board";
import { Util, Box, Vec2, State, RawBoard } from "../util";
import M from "materialize-css";
import { Game } from "./game";
const FRAMERATE = 60;

export class BoardCanvas{
  line_width: number = 0.005;
  square_size: Box;
  elem: HTMLCanvasElement;
  cxt: CanvasRenderingContext2D;
  mouse_at: Vec2 | null = null;
  game: Game;
  constructor(element: HTMLCanvasElement,game:Game) {
    this.elem = element;
    this.elem.style.display = "inline-block";
    this.game = game;
    this.cxt = Util.checkIsDefined(element.getContext('2d'));
    this.square_size = new Box(
      (1 - this.line_width * (game.board.width + 1)) / game.board.width,
      (1 - this.line_width * (game.board.height + 1)) / game.board.height
    );
    const listenerMaker = (f:(x:number,y:number)=>void) => (e:MouseEvent) => {
      const rect = this.elem.getBoundingClientRect();
      const x = e.clientX - Math.floor(rect.left);
      const y = e.clientY - Math.floor(rect.top);
      const i = Math.floor(x / this.elem.width * window.devicePixelRatio * game.board.width);
      const j = Math.floor(y / this.elem.height * window.devicePixelRatio * game.board.height);
      f(i, j);
    }

    document.addEventListener('click', listenerMaker((x,y)=>this.onClick(x,y)));
    document.addEventListener('mousemove', listenerMaker((x, y) => this.onMouseMove(x, y)));
    
    setInterval(() => {
      const canvasWrapper = document.getElementById("canvas-wrapper")!;
    
      // resize
      element.width = canvasWrapper.clientWidth * window.devicePixelRatio;
      element.height = canvasWrapper.clientHeight * window.devicePixelRatio;
    
      // update
      this.drawBoard();
    }, 1000 / FRAMERATE);
  }

  drawBoard() {
    const redOverlay = 'rgba(255,0,0,0.3)';
    const grayOverlay = 'rgba(0,0,0,0.2)';
    
    let res: Vec2[] = [];
    if (this.game.isMyTurn() && this.mouse_at) {
      res = this.game.board.check(this.mouse_at.x, this.mouse_at.y);
    }

    for (let y = 0; y < this.game.board.height; y++) {
      for (let x = 0; x < this.game.board.width; x++) {
        this.fillSquare('green', x, y);
        const st = this.game.board.get(x, y);
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
            if (this.game.board.get(x, y) === State.Empty) {
              this.drawStone(
                (this.game.myColor === State.Black ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'),
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

  fillSquare(fillStyle: string | CanvasGradient | CanvasPattern, x: number, y: number) {
    const left = this.line_width + (this.square_size.width + this.line_width) * x;
    const top = this.line_width + (this.square_size.height + this.line_width) * y;
    this.fillRectPercent(fillStyle, left, top, this.square_size.width, this.square_size.height);
  }

  drawStone(fillStyle: string | CanvasGradient | CanvasPattern, strokeStyle: string | CanvasGradient | CanvasPattern, lineWidth: number, scale: number, x: number, y: number) {
    this.drawEllipseAtPercent(
      fillStyle,
      strokeStyle,
      lineWidth * (this.elem.height + this.elem.width) / 2,
      (2*x+1)/(2*this.game.board.width),
      (2*y+1)/(2*this.game.board.height),
      this.square_size.width * scale,
      this.square_size.height * scale
    );
  }

  onClick(x: number, y: number) {
    if (x >= 0 && x < this.game.board.width
      && y >= 0 && y < this.game.board.height
      && this.game.myColor === this.game.board.curState) {
      this.game.emit("put", { x: x, y: y });
    }
  }

  onMouseMove(x: number, y: number) {
    if (x < 0 || x >= this.game.board.width || y < 0 || y >= this.game.board.height) {
      this.mouse_at = null;
    } else {
      this.mouse_at = new Vec2(x, y);
    }
  }

  fillRectPercent(fillStyle: string | CanvasGradient | CanvasPattern, x: number, y: number, w: number, h: number) {
    const t = this.cxt.fillStyle;
    this.cxt.fillStyle = fillStyle;
    this.cxt.fillRect(
      this.elem.width * x,
      this.elem.height * y,
      this.elem.width * w,
      this.elem.height * h);
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
      cx * this.elem.width,
      cy * this.elem.height,
      width * this.elem.width,
      height * this.elem.height
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
}
