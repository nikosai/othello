/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/board.ts":
/*!**********************!*\
  !*** ./src/board.ts ***!
  \**********************/
/*! exports provided: Board */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Board\", function() { return Board; });\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ \"./src/util.ts\");\n\n// 盤面\nvar Board = /** @class */ (function () {\n    function Board(w, h) {\n        this.curState = _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Black;\n        this.width = w;\n        this.height = h;\n        this.sqs = [];\n        for (var i = 0; i < w + 2; i++) {\n            this.sqs[i] = [];\n            for (var j = 0; j < h + 2; j++) {\n                this.sqs[i][j] = _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Empty;\n            }\n        }\n        this.init();\n    }\n    Board.prototype.set = function (x, y, s) {\n        this.sqs[x + 1][y + 1] = s;\n    };\n    Board.prototype.get = function (x, y) {\n        return this.sqs[x + 1][y + 1];\n    };\n    Board.prototype.init = function () {\n        this.set(3, 3, _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Black);\n        this.set(4, 4, _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Black);\n        this.set(3, 4, _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].White);\n        this.set(4, 3, _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].White);\n    };\n    Board.prototype.put = function (x, y) {\n        var res = this.check(x, y);\n        if (res.length === 0)\n            return;\n        this.flipMulti(res);\n        this.set(x, y, this.curState);\n        // this.print();\n        this.curState = _util__WEBPACK_IMPORTED_MODULE_0__[\"Util\"].reverse(this.curState);\n    };\n    // for debug\n    Board.prototype.print = function () {\n        var str = \"\";\n        for (var i = 0; i < this.sqs.length; i++) {\n            var s = this.sqs[i];\n            for (var j = 0; j < s.length; j++) {\n                // const f = (s: State) => {\n                //   switch (s) {\n                //     case State.Black: return \"B\";\n                //     case State.White: return \"W\";\n                //     case State.Empty: return \" \";\n                //   }\n                // }\n                // str += f(s[j]);\n                str += s[j];\n            }\n            str += '\\n';\n        }\n        console.log(str);\n    };\n    Board.prototype.flip = function (x, y) {\n        this.set(x, y, _util__WEBPACK_IMPORTED_MODULE_0__[\"Util\"].reverse(this.get(x, y)));\n    };\n    Board.prototype.flipMulti = function (arr) {\n        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {\n            var a = arr_1[_i];\n            this.flip(a.x, a.y);\n        }\n    };\n    Board.prototype.check = function (x, y) {\n        if (this.get(x, y) !== _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Empty)\n            return [];\n        var ret = [];\n        for (var dy = -1; dy <= 1; dy++) {\n            for (var dx = -1; dx <= 1; dx++) {\n                if (dx === 0 && dy === 0)\n                    continue;\n                var res = this.checkSub(x, y, dx, dy);\n                if (res === null)\n                    continue;\n                ret.push.apply(ret, res);\n            }\n        }\n        return ret;\n    };\n    Board.prototype.checkSub = function (x, y, dx, dy) {\n        var x1 = x + dx;\n        var y1 = y + dy;\n        var s1 = this.get(x1, y1);\n        if (s1 === _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Empty)\n            return null;\n        if (this.curState === s1)\n            return [];\n        var ret = this.checkSub(x1, y1, dx, dy);\n        if (ret === null)\n            return null;\n        ret.push(new _util__WEBPACK_IMPORTED_MODULE_0__[\"Vec2\"](x1, y1));\n        return ret;\n    };\n    return Board;\n}());\n\n\n\n//# sourceURL=webpack:///./src/board.ts?");

/***/ }),

/***/ "./src/canvas.ts":
/*!***********************!*\
  !*** ./src/canvas.ts ***!
  \***********************/
/*! exports provided: BoardCanvas */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BoardCanvas\", function() { return BoardCanvas; });\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ \"./src/util.ts\");\n\nvar BoardCanvas = /** @class */ (function () {\n    function BoardCanvas(element, board) {\n        var _this = this;\n        this.line_width = 0.005;\n        this.mouse_at = null;\n        this.elem = element;\n        this.cxt = _util__WEBPACK_IMPORTED_MODULE_0__[\"Util\"].checkIsDefined(element.getContext('2d'));\n        this.board = board;\n        this.square_size = new _util__WEBPACK_IMPORTED_MODULE_0__[\"Box\"]((1 - this.line_width * (this.board.width + 1)) / this.board.width, (1 - this.line_width * (this.board.height + 1)) / this.board.height);\n        var listenerMaker = function (f) { return function (e) {\n            var rect = _this.elem.getBoundingClientRect();\n            var x = e.clientX - Math.floor(rect.left);\n            var y = e.clientY - Math.floor(rect.top);\n            var i = Math.floor(x / _this.elem.width * _this.board.width);\n            var j = Math.floor(y / _this.elem.height * _this.board.height);\n            f(i, j);\n        }; };\n        document.addEventListener('click', listenerMaker(function (x, y) { return _this.onClick(x, y); }));\n        document.addEventListener('mousemove', listenerMaker(function (x, y) { return _this.onMouseMove(x, y); }));\n    }\n    BoardCanvas.prototype.drawBoard = function () {\n        var redOverlay = 'rgba(255,0,0,0.5)';\n        var grayOverlay = 'rgba(0,0,0,0.2)';\n        var res = [];\n        if (this.mouse_at) {\n            res = this.board.check(this.mouse_at.x, this.mouse_at.y);\n        }\n        for (var y = 0; y < this.board.height; y++) {\n            for (var x = 0; x < this.board.width; x++) {\n                this.fillSquare('green', x, y);\n                this.drawStone(x, y);\n                if (this.mouse_at) {\n                    if (this.mouse_at.equals(x, y)) {\n                        this.fillSquare((res.length > 0 ? redOverlay : grayOverlay), x, y);\n                    }\n                    else if (_util__WEBPACK_IMPORTED_MODULE_0__[\"Vec2\"].in(res, x, y)) {\n                        this.fillSquare(redOverlay, x, y);\n                    }\n                }\n            }\n        }\n    };\n    BoardCanvas.prototype.fillSquare = function (fillStyle, x, y) {\n        var left = this.line_width + (this.square_size.width + this.line_width) * x;\n        var top = this.line_width + (this.square_size.height + this.line_width) * y;\n        this.fillRectPercent(fillStyle, left, top, this.square_size.width, this.square_size.height);\n    };\n    BoardCanvas.prototype.drawStone = function (x, y) {\n        var st = this.board.get(x, y);\n        if (st !== _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Empty) {\n            this.drawEllipseAtPercent((st === _util__WEBPACK_IMPORTED_MODULE_0__[\"State\"].Black ? 'black' : 'white'), 'black', 0.003 * (this.elem.height + this.elem.width) / 2, (2 * x + 1) / (2 * this.board.width), (2 * y + 1) / (2 * this.board.height), this.square_size.width * 0.8, this.square_size.height * 0.8);\n        }\n    };\n    BoardCanvas.prototype.onClick = function (x, y) {\n        if (x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) {\n        }\n        else {\n            this.board.put(x, y);\n        }\n    };\n    BoardCanvas.prototype.onMouseMove = function (x, y) {\n        if (x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) {\n            this.mouse_at = null;\n        }\n        else {\n            this.mouse_at = new _util__WEBPACK_IMPORTED_MODULE_0__[\"Vec2\"](x, y);\n        }\n    };\n    BoardCanvas.prototype.fillRectPercent = function (fillStyle, x, y, w, h) {\n        var t = this.cxt.fillStyle;\n        this.cxt.fillStyle = fillStyle;\n        this.cxt.fillRect(this.elem.width * x, this.elem.height * y, this.elem.width * w, this.elem.height * h);\n        // if (fillStyle === 'rgba(255,0,0,0.5)') {\n        //   console.log(t,this.cxt.fillStyle,\n        //     this.elem.width * x,\n        //     this.elem.height * y,\n        //     this.elem.width * w,\n        //     this.elem.height * h)\n        // }\n        this.cxt.fillStyle = t;\n    };\n    BoardCanvas.prototype.drawEllipseAtPercent = function (fillStyle, strokeStyle, lineWidth, cx, cy, width, height) {\n        var f = this.cxt.fillStyle;\n        var s = this.cxt.strokeStyle;\n        var l = this.cxt.lineWidth;\n        this.cxt.fillStyle = fillStyle;\n        this.cxt.strokeStyle = strokeStyle;\n        this.cxt.lineWidth = lineWidth;\n        this.drawEllipseAt(cx * this.elem.width, cy * this.elem.height, width * this.elem.width, height * this.elem.height);\n        this.cxt.fillStyle = f;\n        this.cxt.strokeStyle = s;\n        this.cxt.lineWidth = l;\n    };\n    BoardCanvas.prototype.drawEllipseAt = function (cx, cy, width, height) {\n        var PI2 = Math.PI * 2;\n        var ratio = height / width;\n        var radius = width / 2;\n        var increment = 1 / radius;\n        this.cxt.beginPath();\n        var x = cx + radius * Math.cos(0);\n        var y = cy - ratio * radius * Math.sin(0);\n        this.cxt.lineTo(x, y);\n        for (var radians = increment; radians < PI2; radians += increment) {\n            x = cx + radius * Math.cos(radians);\n            y = cy - ratio * radius * Math.sin(radians);\n            this.cxt.lineTo(x, y);\n        }\n        this.cxt.closePath();\n        this.cxt.fill();\n        this.cxt.stroke();\n    };\n    return BoardCanvas;\n}());\n\n\n\n//# sourceURL=webpack:///./src/canvas.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ \"./src/util.ts\");\n/* harmony import */ var _board__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./board */ \"./src/board.ts\");\n/* harmony import */ var _canvas__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./canvas */ \"./src/canvas.ts\");\n\n\n\n(function () {\n    var FRAMERATE = 60;\n    var BOARD_WIDTH = 8;\n    var BOARD_HEIGHT = 8;\n    var canvas = document.getElementById(\"canvas\");\n    _util__WEBPACK_IMPORTED_MODULE_0__[\"Util\"].assertIsDefined(canvas);\n    var board = new _board__WEBPACK_IMPORTED_MODULE_1__[\"Board\"](BOARD_WIDTH, BOARD_HEIGHT);\n    var boardCanvas = new _canvas__WEBPACK_IMPORTED_MODULE_2__[\"BoardCanvas\"](canvas, board);\n    setInterval(function () {\n        var canvasWrapper = document.getElementById(\"canvas-wrapper\");\n        _util__WEBPACK_IMPORTED_MODULE_0__[\"Util\"].assertIsDefined(canvasWrapper);\n        // resize\n        canvas.width = canvasWrapper.clientWidth;\n        canvas.height = canvasWrapper.clientHeight;\n        // update\n        boardCanvas.drawBoard();\n    }, 1000 / FRAMERATE);\n})();\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/*! exports provided: Util, Box, Vec2, State */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Util\", function() { return Util; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Box\", function() { return Box; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Vec2\", function() { return Vec2; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"State\", function() { return State; });\nvar Util = /** @class */ (function () {\n    function Util() {\n    }\n    Util.assertIsDefined = function (val) {\n        if (val === undefined || val === null) {\n            throw new Error(\"Expected 'val' to be defined, but received \" + val);\n        }\n    };\n    Util.checkIsDefined = function (val) {\n        Util.assertIsDefined(val);\n        return val;\n    };\n    Util.reverse = function (s) {\n        switch (s) {\n            case State.Black: return State.White;\n            case State.White: return State.Black;\n            case State.Empty: return State.Empty;\n        }\n    };\n    return Util;\n}());\n\nvar Box = /** @class */ (function () {\n    function Box(w, h) {\n        this.width = w;\n        this.height = h;\n    }\n    return Box;\n}());\n\nvar Vec2 = /** @class */ (function () {\n    function Vec2(x, y) {\n        this.x = x;\n        this.y = y;\n    }\n    Vec2.prototype.equals = function (x, y) {\n        return this.x === x && this.y === y;\n    };\n    Vec2.in = function (arr, x, y) {\n        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {\n            var a = arr_1[_i];\n            if (a.equals(x, y))\n                return true;\n        }\n        return false;\n    };\n    return Vec2;\n}());\n\n// マスの状態\nvar State;\n(function (State) {\n    State[State[\"Black\"] = 0] = \"Black\";\n    State[State[\"White\"] = 1] = \"White\";\n    State[State[\"Empty\"] = 2] = \"Empty\";\n})(State || (State = {}));\n\n\n//# sourceURL=webpack:///./src/util.ts?");

/***/ })

/******/ });