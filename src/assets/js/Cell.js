export default class Cell {
  constructor(x, y, size, isReveald = false, isMine = false, isFlag = false) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.isReveald = isReveald;
    this.isMine = isMine;
    this.isFlag = isFlag;
  }
}
