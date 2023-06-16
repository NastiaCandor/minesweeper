/* eslint-disable no-console */
export default class endGameModal {
  constructor(status, score, time) {
    // this.classes = classes;
    this.modal = '';
    this.modalContent = '';
    this.modalCloseBtn = '';
    this.overlay = '';

    this.status = status;
    this.score = score;
    this.time = time;
  }

  // eslint-disable-next-line class-methods-use-this
  createDomNode(node, element, ...classes) {
    // eslint-disable-next-line no-param-reassign
    node = document.createElement(element);
    node.classList.add(...classes);
    return node;
  }

  buildModal(content) {
    this.overlay = this.createDomNode(this.overlay, 'div', 'overlay', 'overlay_modal');
    this.modal = this.createDomNode(this.modal, 'div', 'modal');
    this.modalContent = this.createDomNode(this.modalContent, 'div', 'modal__content');
    // this.modalCloseBtn = this.createDomNode(this.modalCloseBtn, 'button', 'modal__close-btn');
    // this.modalCloseBtn.innerHTML = 'Play again!';

    this.setContent(content);

    this.appendModalElements();

    this.bindEvents();

    this.openModal();
  }

  setContent(content) {
    if (typeof content === 'string') {
      this.modalContent.innerHTML = content;
    } else {
      this.modalContent.innerHTML = '';
      this.modalContent.appendChild(content);
    }
  }

  appendModalElements() {
    this.modal.append(this.modalContent);
    this.modal.append(this.modalCloseBtn);
    this.overlay.append(this.modal);
  }

  // eslint-disable-next-line class-methods-use-this
  closeModal(e) {
    const classes = e.target.classList;
    if (classes.contains('overlay') || classes.contains('modal__close-btn') || classes.contains('modal__close-icon')) {
      document.querySelector('.modal').classList.add('modal-close');
      document.body.classList.remove('_lock');
      setTimeout(() => {
        document.querySelector('.overlay').remove();
      }, 450);
    }
  }

  bindEvents() {
    this.modalCloseBtn.addEventListener('click', this.closeModal);
  }

  openModal() {
    document.body.append(this.overlay);
    document.body.classList.toggle('_lock');
    this.modal.classList.add('modal-open');
  }

  generateGameModal() {
    let template = '';
    const modalContent = document.createElement('div');
    modalContent.className = 'end-modal__content';

    template += '<h3 class="modal__title">';
    if (this.status === 'lose') {
      template += 'Game over!</h3>';
    } else {
      template += 'You Win!</h3>';
    }

    template += '<div class="modal__info">';
    template += `<div class="modal__score">Score:<span>${this.score}</span></div>`;
    template += `<div class="modal__time">Time:<span>${this.time}</span></div>`;
    template += '</div>';

    if (localStorage.getItem('results') !== null) {
      const lastResults = localStorage.getItem('results').split(';');
      template += '<div class="modal__last-results">';
      template += '<h4 class="modal__results-title">Last results:</h4>';
      lastResults.forEach((el, ind) => {
        if (el !== '') {
          template += `<p class="modal__results-text"><span>${ind + 1}</span> ${el}</p>`;
        }
      });
      template += '</div>';
    }

    modalContent.innerHTML = template;

    this.modalCloseBtn = this.createDomNode(this.modalCloseBtn, 'button', 'modal__close-btn');
    this.modalCloseBtn.innerHTML = 'Play again!';

    return modalContent;
  }

  generateResultsModal() {
    let template = '';
    const modalContent = document.createElement('div');
    modalContent.className = 'end-modal__content';

    template += '<h3 class="modal__title">Results</h3>';

    const lastResults = localStorage.getItem('results').split(';');

    template += '<div class="modal__last-results">';
    lastResults.forEach((el, ind) => {
      if (el !== '') {
        template += `<p class="modal__results-text"><span>${ind + 1}</span> ${el}</p>`;
      }
    });
    template += '</div>';

    modalContent.innerHTML = template;

    this.modalCloseBtn = this.createDomNode(this.modalCloseBtn, 'button', 'modal__close-btn');
    this.modalCloseBtn.innerHTML = 'Continue playing!';

    return modalContent;
  }

  renderModal(type) {
    let content;
    switch (type) {
      case 'GameOver':
        content = this.generateGameModal();
        this.buildModal(content);
        break;
      case 'ShowResults':
        content = this.generateResultsModal();
        this.buildModal(content);
        break;
      default:
        break;
    }
  }
}
