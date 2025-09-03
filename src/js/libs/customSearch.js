/**
 * Класс CustomSearch реализует простой функционал поиска по элементам внутри контейнера.
 * Поддерживает подсветку найденного текста и открытие/закрытие блока результатов.
 *
 * @example
 * const searchInstance = new CustomSearch(document.querySelector('[data-search]'));
 *
 * @class
 */
export class CustomSearch {
  /**
   * Хранит все созданные экземпляры класса.
   * @type {CustomSearch[]}
   */
  static instances = [];

  /**
   * Создаёт новый экземпляр поиска для указанного элемента.
   * @param {HTMLElement} el - Корневой элемент поиска, содержащий input и элементы для поиска.
   * @param {Object} [options={}] - Дополнительные настройки (пока не используются).
   */
  constructor(el, options = {}) {
    this.el = el;
    if (!el) return;
    this.hidden = !!el.dataset.search;
    /**
     * Элемент input для ввода запроса.
     * @type {HTMLInputElement}
     */
    this.input = this.el.querySelector('[data-search-input]');
    if (!this.input) return;


    this.list = this.el.querySelectorAll('[data-search-item]');
    this.options = {
      ...options,
    };

    this.init();
    CustomSearch.instances.push(this);
  }

  /**
   * Инициализация обработчиков событий.
   * Обрабатывает ввод в input и закрытие поиска при клике вне компонента.
   */
  init() {
    this.input.addEventListener("input", this.inputDebounce.bind(this));
    document.addEventListener("click", (evt) => {
      const target = evt.target.closest('[data-search]');
      if (!target) {
        this.el.classList.remove("open");
      }
    });
  }

  /**
   * Обработчик ввода текста в поле поиска с подсветкой совпадений.
   * Показывает блок результатов, если есть совпадения, иначе скрывает.
   */
  inputDebounce() {
    const query = this.input.value.trim().toLowerCase();
    this.items = this.el.querySelectorAll('[data-search-text]');
    let anyMatch = false;

    this.items.forEach(titleEl => {
      const originalText = titleEl.textContent;
      const lowerText = originalText.toLowerCase();
      const item = titleEl.closest('[data-search-item]');
      // Очистка предыдущей подсветки
      titleEl.innerHTML = originalText;


      if (query && lowerText.includes(query)) {
        if (this.hidden && item) {
          item.style.removeProperty('display');
        }
        
        anyMatch = true;
        const regex = new RegExp(`(${query})`, "gi");
        titleEl.innerHTML = originalText.replace(regex, '<b class="highlight">$1</b>');
      } else {
        if (this.hidden && item) {
          item.style.display = 'none';
        }
      }
    });

    if (query && anyMatch) {
      this.el.classList.add("open");
    } else {
      this.el.classList.remove("open");
    }

    if (query.length === 0) {
      this.list.forEach(item => item.style.removeProperty('display'));
    }
  }
}
