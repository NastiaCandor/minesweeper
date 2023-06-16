/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */

// Image import
import Cell from './Cell';
import GameStyle from './GameStyles';
import GameModal from './GameModal';
import mineIcon from '../image/mine_icon_red.png';
import flagIcon from '../image/flag_icon.png';
import flagIconDarkTheme from '../image/flag_icon_dark-theme.png';

// Sounds import
import mineExplosion from '../sound/mineExplosion.mp3';
import loseSound from '../sound/GameOver.mp3';
import winSound from '../sound/YouWin.mp3';
import revealCell from '../sound/revealCell.mp3';
import setFlag from '../sound/setFlag.mp3';
import resetFlag from '../sound/resetFlag.mp3';

// Image const
const imgMine = new Image();
imgMine.src = mineIcon;
const imgFlag = new Image();
imgFlag.src = flagIcon;
const imgFlagDarkTheme = new Image();
imgFlagDarkTheme.src = flagIconDarkTheme;

// Audio const
const mineSound = new Audio();
mineSound.src = mineExplosion;
const gameOverSound = new Audio();
gameOverSound.src = loseSound;
const youWinSound = new Audio();
youWinSound.src = winSound;
const revealCellSound = new Audio();
revealCellSound.src = revealCell;
const setFlagSound = new Audio();
setFlagSound.src = setFlag;
const resetFlagSound = new Audio();
resetFlagSound.src = resetFlag;

export default class Minesweeper {
  constructor(dom, gameSize, mineCount, cellSize, mode) {
    this.dom = dom;
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.cellSize = 0;
    this.mineCount = mineCount;
    this.mineField = null;
    this.numberField = null;
    this.cols = mode;
    this.rows = mode;
    this.mineLeft = mineCount;
    this.start = true;
    this.mineCoord = null;
    this.cellLeft = mode * mode;
    this.flagCount = mineCount;
    this.stopGame = false;
    this.moveCount = 0;
    this.mode = 'easy';

    this.modeEasyMine = 10;
    this.modeMediumMine = 40;
    this.modeHardMine = 99;

    this.sound = true;

    this.timer = null;
    this.timeCount = 0;

    this.firstInit();
    this.init();
  }

  firstInit() {
    this.createMineField();
    this.checkRastart();
    this.lastResults();
    this.loadGameListener();
    this.saveGameListener();
    this.changeMineCount();
    this.changeTheme();
    this.soundListener();
    this.checkCellSize();
    this.killTimer();
  }

  init() {
    this.getCellSize();
    this.buildNewCanvas();
    this.mineDrowCanvas();

    const timer = document.querySelector('.minesweeper__time-panel');
    timer.innerHTML = this.timeToString();
    const minesCounter = document.querySelector('.minesweeper__mine-panel');
    minesCounter.innerHTML = this.flagCount;

    const movesCount = document.querySelector('.minesweeper__moves-number');
    movesCount.innerHTML = this.moveCount;

    const saveGameBtn = document.querySelector('.minesweeper__btn-save');
    saveGameBtn.classList.add('_disable');

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (!this.stopGame) {
        const clickedCell = this.getClickedCell(e);
        if (!clickedCell.isReveald) {
          if (this.sound) {
            if (clickedCell.isFlag) {
              resetFlagSound.play();
            } else {
              setFlagSound.play();
            }
          }
          this.flagCount = (clickedCell.isFlag) ? this.flagCount + 1 : this.flagCount - 1;
          clickedCell.isFlag = !(clickedCell.isFlag);
        }
        if (clickedCell.isReveald && clickedCell.isFlag) {
          clickedCell.isFlag = !(clickedCell.isFlag);
          this.flagCount = (clickedCell.isFlag) ? this.flagCount + 1 : this.flagCount - 1;
        }
        this.mineDrowCanvas();
        minesCounter.innerHTML = this.flagCount;
      }
    });

    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      if ((e.button === 0) && (!this.stopGame)) {
        const clickedCell = this.getClickedCell(e);
        if (this.start) {
          if (this.sound) revealCellSound.play();
          // eslint-disable-next-line no-undef
          let reduceCells = null;
          if ((this.cellLeft - this.mineCount) > 7) {
            reduceCells = [];
            for (let i = 0; i < 3; i += 1) {
              reduceCells[i] = [];
              for (let j = 0; j < 3; j += 1) {
                reduceCells[i].push([(clickedCell.x - 1 + j), (clickedCell.y - 1 + i)]);
              }
            }
          } else {
            reduceCells = [];
            reduceCells[0] = clickedCell.x;
            reduceCells[1] = clickedCell.y;
          }

          this.minePlacement(reduceCells);
          this.getNumbersField();
          this.clearFlagStart();
          this.stopGame = false;
          this.start = false;
          this.timeCount = 0;
          this.setTimer();
          saveGameBtn.classList.remove('_disable');
        }

        if (!clickedCell.isReveald) {
          if (this.sound) revealCellSound.play();
          if (!clickedCell.isFlag) {
            clickedCell.isReveald = true;
            this.moveCount += 1;
            movesCount.innerHTML = this.moveCount;
            if (clickedCell.isMine) {
              clickedCell.isReveald = true;
              this.mineDrowCanvas();
              this.gameOver();
            } else {
              this.checkEmpty(clickedCell);
              this.mineDrowCanvas();
              this.checkWin();
            }
          }
        }
        minesCounter.innerHTML = this.flagCount;
      }
    });
  }

  getCellSize() {
    const maxWidth = document.body.clientWidth;
    if (maxWidth < 750) {
      this.cellSize = Math.trunc(maxWidth / this.rows);
      this.width = this.cellSize * this.rows;
      this.height = this.width;
    } else {
      switch (this.mode) {
        case 'easy':
          this.cellSize = Math.trunc(500 / this.rows);
          break;
        case 'medium':
          this.cellSize = Math.trunc(600 / this.rows);
          break;
        case 'hard':
          this.cellSize = Math.trunc(750 / this.rows);
          break;
        default:
          break;
      }
      this.width = this.cellSize * this.rows;
      this.height = this.width;
    }
  }

  checkCellSize() {
    window.addEventListener('resize', () => {
      this.init();
    });
  }

  soundListener() {
    const btnSound = document.querySelector('.minesweeper__btn-music');
    btnSound.addEventListener('click', () => {
      this.sound = !this.sound;
      btnSound.classList.toggle('minesweeper__btn-music_off');
    });
  }

  changeTheme() {
    const btnThemeChange = document.querySelector('.minesweeper__btn-theme-change');
    btnThemeChange.addEventListener('click', () => {
      this.mineDrowCanvas();
    });
  }

  changeMineCount() {
    const mineCountBtn = document.querySelector('.minesweeper__btn-mine_edit');
    const mineCountInput = document.querySelector('.minesweeper__input-mine');
    mineCountInput.disabled = true;

    mineCountBtn.addEventListener('click', () => {
      if (mineCountBtn.classList.contains('minesweeper__btn-mine_edit')) {
        mineCountInput.disabled = false;
        mineCountBtn.classList.remove('minesweeper__btn-mine_edit');
        mineCountBtn.classList.add('minesweeper__btn-mine_save');
      } else {
        switch (this.mode) {
          case 'easy':
            this.modeEasyMine = mineCountInput.value;
            break;
          case 'medium':
            this.modeMediumMine = mineCountInput.value;
            break;
          case 'hard':
            this.modeHardMine = mineCountInput.value;
            break;
          default:
            break;
        }
        this.mineCount = +mineCountInput.value;
        this.mineLeft = this.mineCount;
        this.flagCount = this.mineLeft;
        mineCountInput.disabled = true;
        mineCountBtn.classList.add('minesweeper__btn-mine_edit');
        mineCountBtn.classList.remove('minesweeper__btn-mine_save');
        this.restartGame();
      }
    });
  }

  buildNewCanvas() {
    if (document.querySelector('.mainesweeper__canvas') !== null) {
      document.querySelector('.mainesweeper__canvas').remove();
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'mainesweeper__canvas';
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx = this.canvas.getContext('2d');

    this.dom.appendChild(this.canvas);
  }

  loadGameListener() {
    const loadGameBtn = document.querySelector('.minesweeper__btn-load');
    const saveGameBtn = document.querySelector('.minesweeper__btn-save');
    const modeSelector = document.querySelector('.minesweeper__mode-list');
    if (localStorage.getItem('GameSave') === null) {
      loadGameBtn.classList.add('_disable');
    } else {
      loadGameBtn.classList.remove('_disable');
    }
    loadGameBtn.addEventListener('click', () => {
      if (localStorage.getItem('GameSave') !== null) {
        this.killTimer();
        this.start = false;
        this.stopGame = false;
        const data = localStorage.getItem('GameSave').split(';');
        this.rows = data[0];
        this.cols = data[1];
        const mineField = data[2].split('/');
        this.mineField = [];
        for (let x = 0; x < this.rows; x += 1) {
          this.mineField[x] = [];
          for (let y = 0; y < this.cols; y += 1) {
            const cell = JSON.parse(mineField[x * this.rows + y]);
            this.mineField[x][y] = new Cell(cell.x, cell.y, cell.size, cell.isReveald, cell.isMine, cell.isFlag);
          }
        }
        this.getNumbersField();
        this.timeCount = +data[3];
        this.moveCount = +data[4];
        this.flagCount = +data[5];
        this.mode = data[6];
        this.width = +data[7];
        this.height = +data[8];
        this.cellSize = +data[9];
        this.cellLeft = +data[10];
        this.mineLeft = +data[11];
        this.mineCount = +data[12];

        modeSelector.value = this.mode;
        this.setTimer();
        this.init();
        saveGameBtn.classList.remove('_disable');
      }
    });
  }

  saveGameListener() {
    const saveGameBtn = document.querySelector('.minesweeper__btn-save');
    const loadGameBtn = document.querySelector('.minesweeper__btn-load');
    saveGameBtn.addEventListener('click', () => {
      if (localStorage.getItem('GameSave') === null) loadGameBtn.classList.remove('_disable');
      let saveData = '';
      saveData += `${this.rows};${this.cols};`;
      for (let x = 0; x < this.rows; x += 1) {
        for (let y = 0; y < this.cols; y += 1) {
          const currCell = this.mineField[x][y];
          saveData += `${JSON.stringify(currCell)}/`;
        }
      }
      saveData += ';';
      saveData += `${this.timeCount};`;
      saveData += `${this.moveCount};`;
      saveData += `${this.flagCount};`;
      saveData += `${this.mode};`;
      saveData += `${this.width};`;
      saveData += `${this.height};`;
      saveData += `${this.cellSize};`;
      saveData += `${this.cellLeft};`;
      saveData += `${this.mineLeft};`;
      saveData += `${this.mineCount}`;
      localStorage.setItem('GameSave', saveData);
    });
  }

  lastResults() {
    const showResultsBtn = document.querySelector('.minesweeper__btn-results');
    showResultsBtn.addEventListener('click', () => {
      const modal = new GameModal('lose', '0', this.timeToString());
      modal.renderModal('ShowResults');
    });
  }

  restartGame() {
    this.stopGame = false;
    this.start = true;
    this.flagCount = this.mineCount;
    this.timeCount = 0;
    this.moveCount = 0;
    this.killTimer();
    this.createMineField();
    this.init();
  }

  checkRastart() {
    const mineCountInput = document.querySelector('.minesweeper__input-mine');
    const restartBtn = document.querySelector('.minesweeper__restart-btn');
    restartBtn.addEventListener('click', () => {
      if (!this.stopGame) {
        this.restartGame();
      }
    });
    const modeList = document.querySelector('.minesweeper__mode-list');
    modeList.addEventListener('change', (e) => {
      if (!this.stopGame) {
        this.killTimer();
        let mineCount;
        let mode;
        switch (e.target.value) {
          case 'easy':
            this.mode = 'easy';
            mineCount = this.modeEasyMine;
            mode = 10;
            mineCountInput.value = this.modeEasyMine;
            break;
          case 'medium':
            this.mode = 'medium';
            mineCount = this.modeMediumMine;
            mode = 15;
            mineCountInput.value = this.modeMediumMine;
            break;
          case 'hard':
            this.mode = 'hard';
            mineCount = this.modeHardMine;
            mode = 25;
            mineCountInput.value = this.modeHardMine;
            break;
          default:
            mineCount = 10;
            mode = 10;
        }
        this.stopGame = false;
        this.start = true;
        this.mineCount = mineCount;
        this.mineField = null;
        this.numberField = null;
        this.cols = mode;
        this.rows = mode;
        this.mineLeft = mineCount;
        this.mineCoord = null;
        this.cellLeft = mode * mode;
        this.flagCount = mineCount;
        this.timeCount = 0;
        this.moveCount = 0;
        this.createMineField();
        this.init();
      }
    });
  }

  timeToString() {
    let sec = Math.trunc(this.timeCount % 60).toString();
    let min = Math.trunc((this.timeCount / 60) % 60).toString();
    sec = (sec.length < 2) ? `0${sec}` : sec;
    min = (min.length < 2) ? `0${min}` : min;
    return `${min}:${sec}`;
  }

  setTimer() {
    const timer = document.querySelector('.minesweeper__time-panel');
    timer.innerHTML = this.timeToString();
    this.timer = window.setInterval(() => {
      if (this.stopGame) {
        clearInterval(this.timer);
      } else {
        this.timeCount += 1;
        timer.innerHTML = this.timeToString();
      }
    }, 1000);
  }

  killTimer() {
    clearInterval(this.timer);
  }

  clearFlagStart() {
    for (let x = 0; x < this.cols; x += 1) {
      for (let y = 0; y < this.rows; y += 1) {
        const currCell = this.mineField[x][y];
        currCell.isFlag = false;
      }
    }
    this.flagCount = this.mineCount;
  }

  checkEmpty(cell) {
    const checkCell = this.mineField[cell.x][cell.y];
    if (checkCell.isFlag) checkCell.isFlag = !checkCell.isFlag;
    if (this.numberField[cell.x][cell.y] === 0) {
      this.mineField[cell.x][cell.y].isReveald = true;
      if (cell.x - 1 >= 0) {
        const currCell = this.mineField[cell.x - 1][cell.y];
        if (!currCell.isReveald) {
          currCell.isReveald = true;
          if (this.numberField[cell.x - 1][cell.y] === 0) {
            this.checkEmpty(currCell);
          }
        }
        if (cell.y - 1 >= 0) {
          const nextCell = this.mineField[cell.x - 1][cell.y - 1];
          if (!nextCell.isReveald) {
            nextCell.isReveald = true;
            if (this.numberField[cell.x - 1][cell.y - 1] === 0) {
              this.checkEmpty(nextCell);
            }
          }
        }
      }
      if (cell.y - 1 >= 0) {
        const currCell = this.mineField[cell.x][cell.y - 1];
        if (!currCell.isReveald) {
          currCell.isReveald = true;
          if (this.numberField[cell.x][cell.y - 1] === 0) {
            this.checkEmpty(currCell);
          }
        }
        if (cell.x + 1 < this.rows) {
          const nextCell = this.mineField[cell.x + 1][cell.y - 1];
          if (!nextCell.isReveald) {
            nextCell.isReveald = true;
            if (this.numberField[cell.x + 1][cell.y - 1] === 0) {
              this.checkEmpty(nextCell);
            }
          }
        }
      }
      if ((cell.x + 1) < this.rows) {
        const currCell = this.mineField[cell.x + 1][cell.y];
        if (!currCell.isReveald) {
          currCell.isReveald = true;
          if (this.numberField[cell.x + 1][cell.y] === 0) {
            this.checkEmpty(currCell);
          }
        }
        if (cell.y + 1 < this.rows) {
          const nextCell = this.mineField[cell.x + 1][cell.y + 1];
          if (!nextCell.isReveald) {
            nextCell.isReveald = true;
            if (this.numberField[cell.x + 1][cell.y + 1] === 0) {
              this.checkEmpty(nextCell);
            }
          }
        }
      }
      if ((cell.y + 1) < this.cols) {
        const currCell = this.mineField[cell.x][cell.y + 1];
        if (!currCell.isReveald) {
          currCell.isReveald = true;
          if (this.numberField[cell.x][cell.y + 1] === 0) {
            this.checkEmpty(currCell);
          }
        }
        if (cell.x - 1 >= 0) {
          const nextCell = this.mineField[cell.x - 1][cell.y + 1];
          if (!nextCell.isReveald) {
            nextCell.isReveald = true;
            if (this.numberField[cell.x - 1][cell.y + 1] === 0) {
              this.checkEmpty(nextCell);
            }
          }
        }
      }
    }
  }

  getClickedCell(e) {
    const clickX = e.pageX - this.canvas.offsetLeft;
    const clickY = e.pageY - this.canvas.offsetTop;
    return this.getCellCoord(clickX, clickY);
  }

  createMineField() {
    this.mineField = [];
    for (let x = 0; x < this.rows; x += 1) {
      this.mineField[x] = [];
      for (let y = 0; y < this.cols; y += 1) {
        this.mineField[x][y] = new Cell(x, y, this.cellSize);
      }
    }
  }

  minePlacement(reduceCells) {
    this.mineCoord = [];
    let minesLeftover = this.mineCount;
    while (minesLeftover > 0) {
      const x = Math.floor(Math.random() * this.rows);
      const y = Math.floor(Math.random() * this.cols);

      let flag = true;

      if (Array.isArray(reduceCells[0])) {
        for (let i = 0; i < 3; i += 1) {
          for (let j = 0; j < 3; j += 1) {
            const compX = reduceCells[i][j][0];
            const compY = reduceCells[i][j][1];
            if (x === compX && y === compY) {
              flag = false;
            }
          }
        }
      } else {
        const compX = reduceCells[0];
        const compY = reduceCells[1];
        if (x === compX && y === compY) {
          flag = false;
        }
      }

      if (flag && (!this.mineField[x][y].isMine)) {
        this.mineField[x][y].isMine = true;
        this.mineCoord.push([x, y]);
        minesLeftover -= 1;
      }
    }
  }

  getNumberColor(number, theme) {
    switch (number) {
      case '1':
        return GameStyle[theme].one;
      case '2':
        return GameStyle[theme].two;
      case '3':
        return GameStyle[theme].three;
      case '4':
        return GameStyle[theme].four;
      case '5':
        return GameStyle[theme].five;
      case '6':
        return GameStyle[theme].six;
      case '7':
        return GameStyle[theme].seven;
      case '8':
        return GameStyle[theme].eight;

      default:
        return this.mineCount;
    }
  }

  mineDrowCanvas() {
    const theme = (document.querySelector('.minesweeper_dark-theme') === null) ? 'basic' : 'dark';
    let numberCell = 0;
    for (let x = 0; x < this.cols; x += 1) {
      for (let y = 0; y < this.rows; y += 1) {
        const currCell = this.mineField[x][y];

        if (!currCell.isReveald) {
          // count unreveald cells
          numberCell += 1;
          // draw a cell
          this.ctx.fillStyle = GameStyle[theme].background;
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

          this.ctx.fillStyle = GameStyle[theme].shadow;
          this.ctx.fillRect(x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 3, this.cellSize - 3);

          this.ctx.fillStyle = GameStyle[theme].tile;
          this.ctx.fillRect(x * this.cellSize + 3, y * this.cellSize + 3, (this.cellSize - 5), (this.cellSize - 5));
        } else if (currCell.isMine) {
          // draw background
          this.ctx.fillStyle = GameStyle[theme].background;
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
          // draw image of a mine
          this.ctx.drawImage(imgMine, x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 3, this.cellSize - 3);
        } else {
          this.ctx.fillStyle = GameStyle[theme].background;
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

          const number = (this.numberField[x][y]).toString();
          if (number > 0) {
            this.ctx.fillStyle = this.getNumberColor(number, theme);
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'center';
            this.ctx.font = `${this.cellSize - 2}px DM Mono`;
            const placeX = x * this.cellSize + this.cellSize / 2;
            const placeY = y * this.cellSize + this.cellSize / 2;
            this.ctx.fillText(number, placeX, placeY, this.cellSize);
          }
        }
        if (currCell.isFlag) {
          // draw a cell
          this.ctx.fillStyle = GameStyle[theme].background;
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

          this.ctx.fillStyle = GameStyle[theme].shadow;
          this.ctx.fillRect(x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 3, this.cellSize - 3);

          this.ctx.fillStyle = GameStyle[theme].tile;
          this.ctx.fillRect(x * this.cellSize + 3, y * this.cellSize + 3, (this.cellSize - 5), (this.cellSize - 5));
          // draw image of a flag
          if (theme === 'basic') {
            this.ctx.drawImage(imgFlag, x * this.cellSize + 5, y * this.cellSize + 5, this.cellSize - 10, this.cellSize - 10);
          } else {
            this.ctx.drawImage(imgFlagDarkTheme, x * this.cellSize + 5, y * this.cellSize + 5, this.cellSize - 10, this.cellSize - 10);
          }
        }
      }
    }
    this.cellLeft = numberCell;
  }

  getCellCoord(xPos, yPos) {
    return this.mineField[Math.floor(xPos / this.cellSize)][Math.floor(yPos / this.cellSize)];
  }

  getNumbersField() {
    const field = this.mineField;
    const result = field.map((mat, row) => mat.map((el, col) => {
      let count = 0;
      for (let i = (row - 1 >= 0) ? (row - 1) : row; i < row + 2 && i < field.length; i += 1) {
        for (let j = col - 1 >= 0 ? col - 1 : col; j < col + 2 && j < mat.length; j += 1) {
          if (field[i][j].isMine === true && !(i === row && j === col)) count += 1;
        }
      }
      return count;
    }));
    this.numberField = result;
  }

  saveResult() {
    if (localStorage.getItem('results')) {
      const results = localStorage.getItem('results');
      const arr = results.split(';');
      if (arr.length > 9) {
        const restResults = results.slice(0, -(arr[9].length + 1));
        const newResults = `Score:${this.moveCount} Time:${this.timeToString()} Mode:${this.mode};${restResults}`;
        localStorage.setItem('results', newResults);
      } else {
        const newResults = `Score:${this.moveCount} Time:${this.timeToString()} Mode:${this.mode};${results}`;
        localStorage.setItem('results', newResults);
      }
    } else {
      const newResults = `Score:${this.moveCount} Time:${this.timeToString()} Mode:${this.mode};`;
      localStorage.setItem('results', newResults);
    }
  }

  endGame() {
    document.querySelector('.minesweeper__mode-list').disabled = false;
    document.querySelector('.minesweeper__btn-save').disabled = false;
    document.querySelector('.minesweeper__btn-load').disabled = false;
    document.querySelector('.minesweeper__btn-results').disabled = false;
    this.flagCount = this.mineCount;
    this.stopGame = false;
    this.start = true;
    this.moveCount = 0;
    this.timeCount = 0;
    this.flagCount = this.mineCount;
    this.createMineField();
    this.init();
  }

  checkWin() {
    if (this.cellLeft === this.mineCount) {
      this.stopGame = true;
      const modal = new GameModal('win', this.moveCount, this.timeToString());
      modal.renderModal('GameOver');
      if (this.sound) youWinSound.play();
      this.killTimer();
      this.saveResult();
      this.endGame();
    }
  }

  gameOver() {
    this.moveCount = 0;
    let timer = 300;
    for (let ind = 0; ind < this.mineCoord.length; ind += 1) {
      const cell = this.mineField[this.mineCoord[ind][0]][this.mineCoord[ind][1]];
      if (!cell.isFlag) {
        setTimeout(() => {
          cell.isReveald = true;
          if (this.sound) mineSound.play();
          this.mineDrowCanvas();
        }, timer);
        timer += 300;
      }
    }
    this.stopGame = true;
    this.killTimer();
    document.querySelector('.minesweeper__mode-list').disabled = true;
    document.querySelector('.minesweeper__btn-save').disabled = true;
    document.querySelector('.minesweeper__btn-load').disabled = true;
    document.querySelector('.minesweeper__btn-results').disabled = true;
    setTimeout(() => {
      const modal = new GameModal('lose', '0', this.timeToString());
      modal.renderModal('GameOver');
      if (this.sound) gameOverSound.play();
      this.saveResult();
      this.endGame();
    }, timer);
  }
}
