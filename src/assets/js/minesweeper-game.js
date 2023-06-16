/* eslint-disable no-console */
import Minesweeper from './Minesweeper';

function loadGame(mode, mineCount, cellSize) {
  // dom, width, height, mineCount, cellSize
  const dom = document.querySelector('.minesweeper__game');
  const gameSize = cellSize * mode;
  // eslint-disable-next-line no-unused-vars
  const sweeper = new Minesweeper(dom, gameSize, mineCount, cellSize, mode);
}

function buildGamePanel() {
  let template = '';

  const gameInfoPanel = document.querySelector('.minesweeper__panel');

  const gameSettingsPanel = document.createElement('div');
  const modeSettings = document.createElement('div');
  const modePanel = document.createElement('div');
  const modeText = document.createElement('p');
  const modeBtn = document.createElement('button');
  const modeList = document.createElement('select');
  const minePanel = document.createElement('div');
  const mineText = document.createElement('p');

  const modeEasyOption = new Option('Easy', 'easy');
  const modeMediumOption = new Option('Medium', 'medium');
  const modeHardOption = new Option('hard', 'hard');

  modeSettings.classList.add('minesweeper__mode-settings');
  modePanel.classList.add('minesweeper__mode-panel');
  modeText.classList.add('minesweeper__mode-text');
  modeText.innerHTML = 'mode:';
  modeBtn.classList.add('minesweeper__mode-btn');
  modeList.classList.add('minesweeper__mode-list');
  minePanel.classList.add('minesweeper__mine-set');
  mineText.classList.add('minesweeper__mine-text');
  mineText.innerHTML = 'mines:';
  minePanel.appendChild(mineText);
  template = minePanel.innerHTML;
  template += '<input type="number" name="mine-total" class="minesweeper__input-mine" placeholder="10" ';
  template += 'id="mine_id" required="required" value="10" max="99" min="10" onkeypress="this.value = this.value.substring(0,1)">';
  template += '<button class="minesweeper__button_round minesweeper__btn-mine_edit"></button>';
  minePanel.innerHTML = template;

  modeList.appendChild(modeEasyOption);
  modeList.appendChild(modeMediumOption);
  modeList.appendChild(modeHardOption);

  gameSettingsPanel.classList.add('minesweeper__settings-panel');

  modePanel.appendChild(modeText);
  modePanel.appendChild(modeList);
  modeSettings.appendChild(modePanel);
  modeSettings.appendChild(minePanel);

  const loadSaveGamePanel = document.createElement('div');
  loadSaveGamePanel.classList.add('minesweeper__save-load-list');
  template = '';
  template += '<button class="minesweeper__button_rectangle minesweeper__btn-load">Load game</button>';
  template += '<button class="minesweeper__button_rectangle minesweeper__btn-save">Save game</button>';
  loadSaveGamePanel.innerHTML = template;
  const btnPanel = document.createElement('div');
  btnPanel.classList.add('minesweeper__btn-list');

  const btnTips = document.createElement('button');
  btnTips.classList.add('minesweeper__button_round', 'minesweeper__btn-tips');
  btnTips.innerHTML = '?';
  const clueBlock = document.createElement('div');
  clueBlock.classList.add('minesweeper__clue');
  template = '';
  template += '<p class="minisweeper__tip-results">see Results</p>';
  template += '<p class="minisweeper__tip-mode">change theme</p>';
  template += '<p class="minisweeper__tip-sound">turn on/off sound</p>';
  template += '<p class="minisweeper__tip-mode-change">change mode</p>';
  template += '<p class="minisweeper__tip-mine-count">change mine count</p>';
  template += '<p class="minisweeper__tip-mine-text">You can change mine count for each mode</p>';
  clueBlock.innerHTML = template;
  btnTips.appendChild(clueBlock);
  btnTips.addEventListener('click', () => {
    clueBlock.classList.toggle('minesweeper__clue_visible');
  });

  const btnResults = document.createElement('button');
  btnResults.classList.add('minesweeper__button_round', 'minesweeper__btn-results');
  const btnChangeTheme = document.createElement('button');
  btnChangeTheme.classList.add('minesweeper__button_round', 'minesweeper__btn-theme-change', 'minesweeper__btn-theme-change_light');
  const btnMusicOnOff = document.createElement('button');
  btnMusicOnOff.classList.add('minesweeper__button_round', 'minesweeper__btn-music');

  btnChangeTheme.addEventListener('click', () => {
    document.body.classList.toggle('body_dark-theme');
    document.querySelector('.minesweeper').classList.toggle('minesweeper_dark-theme');
    if (document.body.classList.contains('body_dark-theme')) {
      btnChangeTheme.classList.remove('minesweeper__btn-theme-change_light');
      btnChangeTheme.classList.add('minesweeper__btn-theme-change_dark');
    } else {
      btnChangeTheme.classList.add('minesweeper__btn-theme-change_light');
      btnChangeTheme.classList.remove('minesweeper__btn-theme-change_dark');
    }
  });

  btnPanel.appendChild(btnTips);
  btnPanel.appendChild(btnResults);
  btnPanel.appendChild(btnChangeTheme);
  btnPanel.appendChild(btnMusicOnOff);

  gameSettingsPanel.appendChild(modeSettings);
  gameSettingsPanel.appendChild(loadSaveGamePanel);
  gameSettingsPanel.appendChild(btnPanel);

  const gamePlayPanel = document.createElement('div');
  const timePanel = document.createElement('div');
  const restartBtn = document.createElement('button');
  const flagPanel = document.createElement('div');
  const movesPanel = document.createElement('div');

  gamePlayPanel.classList.add('minesweeper__game-panel');
  timePanel.classList.add('minesweeper__time-panel');
  restartBtn.classList.add('minesweeper__button_rectangle', 'minesweeper__restart-btn');
  restartBtn.innerHTML = 'restart';
  flagPanel.classList.add('minesweeper__mine-panel');

  movesPanel.classList.add('minesweeper__moves-panel');
  movesPanel.innerHTML = '<p class="minesweeper__moves-title">Moves:</p><p class="minesweeper__moves-number">0</p>';

  gamePlayPanel.appendChild(restartBtn);
  gamePlayPanel.appendChild(movesPanel);
  gamePlayPanel.appendChild(timePanel);
  gamePlayPanel.appendChild(flagPanel);

  gameInfoPanel.appendChild(gameSettingsPanel);
  gameInfoPanel.appendChild(gamePlayPanel);
}

export default function minesweeperGame() {
  buildGamePanel();
  // mode EASY 10 by 10 MEDIUM 15 by 15 HARD 25 by 25
  loadGame(10, 10, 50, false);
}
