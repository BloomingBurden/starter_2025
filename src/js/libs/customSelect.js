/**
 * Кастомный селект, заменяющий нативный <select> элемент.
 * @param {HTMLElement} wrapper - Контейнер для селекта.
 * @param {Object} [options] - Настройки селекта.
 * @param {boolean} [options.enableSearch=false] - Включить поле поиска.
 * @param {string} [options.searchClass='custom-select__search'] - Класс для поля поиска.
 * @param {string} [options.selectedClass='custom-select__selected'] - Класс для выбранного элемента.
 * @param {string} [options.icon=''] - Класс SVG-иконки (например, 'icon-arrow-down').
 * @param {Function} [options.onSelect] - Callback при выборе опции.
 */
export class CustomSelect {
  static instances = [];
  static DEFAULTS = {
    CONTAINER_CLASS: 'custom-select',
    OPTION_CLASS: 'custom-select__option',
    OPTIONS_CONTAINER_CLASS: 'custom-select__options',
    SEARCH_CLASS: 'custom-select__search',
    SELECTED_CLASS: 'custom-select__selected',
    DISABLED_CLASS: 'disabled',
    OPEN_CLASS: 'open',
    HIDDEN_CLASS: 'hidden',
    HIGHLIGHTED_CLASS: 'highlighted',
  };

  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;
    this.select = wrapper.querySelector('select');
    if (!this.select) return;

    this.isMultiple = this.select.hasAttribute('multiple');
    this.options = Array.from(this.select.options);
    this.settings = {
      enableSearch: options.enableSearch || false,
      searchClass: options.searchClass || CustomSelect.DEFAULTS.SEARCH_CLASS,
      selectedClass: options.selectedClass || CustomSelect.DEFAULTS.SELECTED_CLASS,
      icon: options.icon || '',
      onSelect: options.onSelect || (() => {}),
    };

    this.build();
    this.bindEvents();
    CustomSelect.instances.push(this);

    if (CustomSelect.instances.length === 1) {
      document.addEventListener('click', CustomSelect.#documentClickHandler);
    }
  }

  build() {
    this.wrapper.classList.add(CustomSelect.DEFAULTS.CONTAINER_CLASS);
    this.select.style.display = 'none';

    this.selected = document.createElement('div');
    this.selected.className = this.settings.selectedClass;
    this.selected.tabIndex = 0;
    this.selected.setAttribute('role', 'combobox');
    this.selected.setAttribute('aria-haspopup', 'listbox');
    this.selected.setAttribute('aria-expanded', 'false');
    this.updateSelectedText();
    this.wrapper.appendChild(this.selected);

    this.optionsContainer = document.createElement('div');
    this.optionsContainer.className = CustomSelect.DEFAULTS.OPTIONS_CONTAINER_CLASS;
    this.optionsContainer.setAttribute('role', 'listbox');
    this.optionsContainer.id = `options-${Math.random().toString(36).slice(2)}`;
    this.selected.setAttribute('aria-controls', this.optionsContainer.id);

    if (this.settings.enableSearch) {
      this.searchInput = document.createElement('input');
      this.searchInput.type = 'text';
      this.searchInput.placeholder = 'Поиск...';
      this.searchInput.className = this.settings.searchClass;
      this.searchInput.setAttribute('aria-label', 'Поиск по опциям');
      this.optionsContainer.appendChild(this.searchInput);
    }

    this.updateOptions();
    this.wrapper.appendChild(this.optionsContainer);
  }

  updateOptions() {
    this.options = Array.from(this.select.options);
    this.optionsContainer.innerHTML = '';
    if (this.settings.enableSearch) {
      this.optionsContainer.appendChild(this.searchInput);
    }
    this.optionDivs = this.options.map(option => {
      const div = document.createElement('div');
      div.className = CustomSelect.DEFAULTS.OPTION_CLASS;
      div.textContent = option.textContent;
      div.dataset.value = option.value;
      div.setAttribute('role', 'option');
      div.setAttribute('aria-selected', 'false');
      div.tabIndex = option.disabled ? -1 : 0;
      if (option.disabled) div.classList.add(CustomSelect.DEFAULTS.DISABLED_CLASS);
      this.optionsContainer.appendChild(div);
      return div;
    });
  }

  updateSelectedText() {
    const text = this.isMultiple ? this.getSelectedTextMultiple() : this.getSelectedText();
    this.selected.innerHTML = `<span class="custom-select__text">${text}</span> ${this.settings.icon ? `<span class="${this.settings.icon}" aria-hidden="true"></span>` : ''}`;
  }

  bindEvents() {
    this.bindSelectedClick();
    this.bindOptionClick();
    this.bindKeyboardNavigation();
    if (this.settings.enableSearch) {
      this.bindSearchInput();
    }
  }

  bindSelectedClick() {
    this.selected.addEventListener('click', () => {
      const isOpen = this.wrapper.classList.toggle(CustomSelect.DEFAULTS.OPEN_CLASS);
      this.selected.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        if (this.settings.enableSearch) {
          this.searchInput.focus();
          this.filterOptions('');
        } else {
          const currentValue = this.select.value;
          let index = this.optionDivs.findIndex(div => div.dataset.value === currentValue && !div.classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS));
          if (index === -1) {
            index = this.optionDivs.findIndex(div => !div.classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS));
          }
          if (this.optionDivs[index]) {
            this.highlightOption(index);
            this.optionDivs[index].focus();
          }
        }
      }
    });
  }

  bindOptionClick() {
    this.optionsContainer.addEventListener('click', e => {
      const option = e.target.closest(`.${CustomSelect.DEFAULTS.OPTION_CLASS}`);
      if (option && !option.classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS)) {
        const value = option.dataset.value;
        if (this.isMultiple) {
          const optionElement = Array.from(this.select.options).find(opt => opt.value === value);
          optionElement.selected = !optionElement.selected;
        } else {
          this.select.value = value;
        }
        this.updateSelectedText();
        this.wrapper.classList.remove(CustomSelect.DEFAULTS.OPEN_CLASS);
        this.selected.setAttribute('aria-expanded', 'false');
        this.select.dispatchEvent(new Event('change'));
        this.settings.onSelect(option);
        this.selected.focus();
      }
    });
  }

  static #documentClickHandler = e => {
    CustomSelect.instances.forEach(instance => {
      if (!instance.wrapper.contains(e.target)) {
        instance.wrapper.classList.remove(CustomSelect.DEFAULTS.OPEN_CLASS);
        instance.selected.setAttribute('aria-expanded', 'false');
      }
    });
  };

  bindKeyboardNavigation() {
    this.selected.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        this.wrapper.classList.add(CustomSelect.DEFAULTS.OPEN_CLASS);
        this.selected.setAttribute('aria-expanded', 'true');
        if (this.settings.enableSearch) {
          this.searchInput.focus();
          this.filterOptions('');
        } else {
          const currentValue = this.select.value;
          let index = this.optionDivs.findIndex(div => div.dataset.value === currentValue && !div.classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS));
          if (index === -1) {
            index = this.optionDivs.findIndex(div => !div.classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS));
          }
          if (this.optionDivs[index]) {
            this.highlightOption(index);
            this.optionDivs[index].focus();
          }
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.wrapper.classList.remove(CustomSelect.DEFAULTS.OPEN_CLASS);
        this.selected.setAttribute('aria-expanded', 'false');
        e.preventDefault();
      }
    });

    this.optionsContainer.addEventListener('keydown', e => {
      const visible = this.settings.enableSearch
        ? this.optionDivs.filter(div => !div.classList.contains(CustomSelect.DEFAULTS.HIDDEN_CLASS))
        : this.optionDivs;

      if (!visible.length) return;

      const currentIndex = visible.findIndex(div => div === document.activeElement);
      let targetIndex = currentIndex;

      if (e.key === 'ArrowDown') {
        targetIndex = this.getNextValidIndex(currentIndex, visible);
        if (visible[targetIndex]) {
          this.highlightOption(targetIndex, visible);
          visible[targetIndex].focus();
        }
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        targetIndex = this.getPreviousValidIndex(currentIndex, visible);
        if (visible[targetIndex]) {
          this.highlightOption(targetIndex, visible);
          visible[targetIndex].focus();
        }
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (currentIndex >= 0 && !visible[currentIndex].classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS)) {
          visible[currentIndex].click();
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.wrapper.classList.remove(CustomSelect.DEFAULTS.OPEN_CLASS);
        this.selected.setAttribute('aria-expanded', 'false');
        this.selected.focus();
        e.preventDefault();
      }
    });

    if (this.settings.enableSearch) {
      this.searchInput.addEventListener('keydown', e => {
        const visible = this.optionDivs.filter(div => !div.classList.contains(CustomSelect.DEFAULTS.HIDDEN_CLASS));
        if (!visible.length) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const currentIndex = visible.findIndex(div => div.classList.contains(CustomSelect.DEFAULTS.HIGHLIGHTED_CLASS));
          const targetIndex = e.key === 'ArrowDown'
            ? this.getNextValidIndex(currentIndex === -1 ? -1 : currentIndex, visible)
            : this.getPreviousValidIndex(currentIndex === -1 ? visible.length : currentIndex, visible);
          if (visible[targetIndex]) {
            this.highlightOption(targetIndex, visible);
            visible[targetIndex].focus();
          }
          e.preventDefault();
        } else if (e.key === 'Enter') {
          const index = visible.findIndex(div => div.classList.contains(CustomSelect.DEFAULTS.HIGHLIGHTED_CLASS));
          if (index >= 0 && !visible[index].classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS)) {
            visible[index].click();
          }
          e.preventDefault();
        } else if (e.key === 'Escape') {
          this.wrapper.classList.remove(CustomSelect.DEFAULTS.OPEN_CLASS);
          this.selected.setAttribute('aria-expanded', 'false');
          this.selected.focus();
          e.preventDefault();
        }
      });
    }
  }

  getNextValidIndex(currentIndex, visible) {
    let nextIndex = currentIndex < visible.length - 1 ? currentIndex + 1 : 0;
    let startIndex = nextIndex;
    while (visible[nextIndex].classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS)) {
      nextIndex = nextIndex < visible.length - 1 ? nextIndex + 1 : 0;
      if (nextIndex === startIndex) break; // Избегаем бесконечного цикла
    }
    return nextIndex;
  }

  getPreviousValidIndex(currentIndex, visible) {
    let prevIndex = currentIndex > 0 ? currentIndex - 1 : visible.length - 1;
    let startIndex = prevIndex;
    while (visible[prevIndex].classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS)) {
      prevIndex = prevIndex > 0 ? prevIndex - 1 : visible.length - 1;
      if (prevIndex === startIndex) break;
    }
    return prevIndex;
  }

  bindSearchInput() {
    this.searchInput.addEventListener('input', this.debounce(() => {
      this.filterOptions(this.searchInput.value);
    }, 200));
  }

  highlightOption(index, visible = this.optionDivs) {
    visible.forEach(div => {
      div.classList.remove(CustomSelect.DEFAULTS.HIGHLIGHTED_CLASS);
      div.setAttribute('aria-selected', 'false');
    });
    if (visible[index] && !visible[index].classList.contains(CustomSelect.DEFAULTS.DISABLED_CLASS)) {
      visible[index].classList.add(CustomSelect.DEFAULTS.HIGHLIGHTED_CLASS);
      visible[index].setAttribute('aria-selected', 'true');
      visible[index].scrollIntoView({ block: 'nearest' });
    }
  }

  filterOptions(search) {
    const s = search.toLowerCase();
    this.optionDivs.forEach(div => {
      const text = div.textContent.toLowerCase();
      div.classList.toggle(CustomSelect.DEFAULTS.HIDDEN_CLASS, !text.includes(s));
    });
    const visible = this.optionDivs.filter(div => !div.classList.contains(CustomSelect.DEFAULTS.HIDDEN_CLASS));
    this.highlightOption(0, visible);
  }

  getSelectedText() {
    return this.select.selectedOptions[0]?.textContent || 'Выбрать';
  }

  getSelectedTextMultiple() {
    const selectedOptions = Array.from(this.select.selectedOptions).map(opt => opt.textContent);
    return selectedOptions.length ? selectedOptions.join(', ') : 'Выбрать';
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  destroy() {
    this.wrapper.innerHTML = '';
    const clone = this.select.cloneNode(true);
    this.wrapper.appendChild(clone);
    CustomSelect.instances = CustomSelect.instances.filter(instance => instance !== this);
    if (!CustomSelect.instances.length) {
      document.removeEventListener('click', CustomSelect.#documentClickHandler);
    }
  }

  update() {
    this.updateOptions();
    this.updateSelectedText();
  }

  static initAll() {
    document.querySelectorAll('[data-custom-select]').forEach(wrapper => {
      if (!wrapper.classList.contains(CustomSelect.DEFAULTS.CONTAINER_CLASS)) {
        new CustomSelect(wrapper);
      }
    });
  }

  static destroyAll() {
    CustomSelect.instances.forEach(instance => instance.destroy());
    CustomSelect.instances = [];
  }

  static reinit() {
    this.destroyAll();
    this.initAll();
  }
}
