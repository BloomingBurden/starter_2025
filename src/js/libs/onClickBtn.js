/**
 * Обрабатывает клики по элементам с атрибутами:
 * - `data-click-btn` — целевая кнопка
 * - `data-click-section` — секция (блок), с которой работает кнопка
 * - `data-click-option="add|remove|toggle"` — действие над блоком
 * - `data-click-checkbox="BOOLEAN"` — отключение сброса других секций
 * - `data-click-fixed="CLASS"` — фиксированная логика переключения (не сбрасывается Escape)
 * - `data-click-body="class1,class2"` — классы, применяемые к `<body>`
 * - `data-click-close` — закрытие родительского блока по нажатию
 *
 * Также:
 * - Убирает/добавляет классы `show` для блоков
 * - Переключает `active` на кнопке
 * - Закрывает по Escape или при клике вне секции
 * - Обрабатывает вложенные секции
 *
 * @function onClickBtn
 * @returns {void}
 */
export const onClickBtn = () => {
    const ELEMENTS = new Map();
    const body = document.body;

    const setDefaultElemes = () => {
        const buttons = document.querySelectorAll("[data-click-btn]");
        buttons.forEach((item) => {
            if (item.classList.contains("active")) {
                const section =
                    item.dataset.clickBtn.length === 0
                        ? item.closest("[data-click-section]")
                        : document.querySelector(item.dataset.clickBtn);
                ELEMENTS.set(item, [section, item]);
            }
        });
    };
    setDefaultElemes();

    const getCloseButton = (target) => {
        let closeButton = target.closest("[data-click-close]");
        if (!closeButton) return;
        let element = null;

        if (closeButton) {
            closeButton =
                closeButton.dataset.clickClose.length === 0
                    ? closeButton
                    : closeButton.dataset.clickClose;
        }

        if (closeButton.length > 0) {
            element = document.querySelector(`.${closeButton}`);
        } else {
            element = closeButton.closest("[data-click-section]");
        }

        return element;
    };

    const removeClassFromBody = (hasBody) => {
        const arr = hasBody.split(",");
        arr.forEach((item) => body.classList.remove(item.trim()));
    };

    const removeAll = (section, button, ELEMENTS, hasBody) => {
        section.classList.remove("show");
        button.classList.remove("active");
        ELEMENTS.delete(button);

        if (hasBody) {
            removeClassFromBody(hasBody);
        }
    };

    const reset = (currentSection, target, method) => {
        ELEMENTS.forEach((item) => {
            const section = item[0];
            const button = item[1];
            const hasBody = item[2];

            const fixed = button.dataset.clickFixed
                ? button.dataset.clickFixed
                : false;
            let hasInner = section.dataset.clickSection?.length > 0 ? true : false;
            let currentClass = currentSection ? currentSection.classList[0] : false;
            let hasChild = section.querySelector(`.${currentClass}`);
            hasChild = hasChild ? true : false;
            let closeButton = getCloseButton(target);
            let nameInnerSection = null;
            let currentBtn = target.closest("[data-click-btn]");

            let checkIsFixedButtons = currentBtn?.dataset?.clickFixed
                ? currentBtn?.dataset?.clickFixed
                : false;

            if (fixed && checkIsFixedButtons) {
                checkIsFixedButtons = fixed === checkIsFixedButtons;
            }

            if (hasInner) {
                nameInnerSection = target.closest(`.${section.dataset.clickSection}`);
            }

            if (!fixed || checkIsFixedButtons) {
                if (section !== currentSection && !hasChild) {
                    removeAll(section, button, ELEMENTS, hasBody);
                }
                if (!!closeButton && section === closeButton) {
                    removeAll(section, button, ELEMENTS, hasBody);
                }
                if (section === currentSection && hasInner && !nameInnerSection) {
                    removeAll(section, button, ELEMENTS, hasBody);
                }
            }
        });
    };

    document.addEventListener("click", (evt) => {
        const target = evt.target;
        const button = target.closest("[data-click-btn]");

        if (button) {
            evt.preventDefault();

            const section =
                button.dataset.clickBtn.length === 0
                    ? button.closest("[data-click-section]")
                    : document.querySelector(button.dataset.clickBtn);
            if (!section) return;

            const option = button.dataset.clickOption
                ? button.dataset.clickOption.toLowerCase()
                : "add";
            const checkbox = button.dataset.clickCheckbox
                ? button.dataset.clickCheckbox
                : false;
            const hasClickBody = button.dataset.clickBody
                ? button.dataset.clickBody
                : false;

            if (!checkbox) {
                reset(section, target, "click");
            }

            if (!ELEMENTS.has(button)) {
                ELEMENTS.set(button, [section, button, hasClickBody]);
            }

            if (hasClickBody) {
                const classes = hasClickBody.split(",");
                classes.forEach((item) => {
                    const trimItem = item.trim();

                    if (body.classList.contains(trimItem)) {
                        body.classList.remove(trimItem);
                    } else {
                        body.classList.add(trimItem);
                    }
                });
            }

            if (option === "add") {
                section.classList.add("show");
                button.classList.add("active");
            }
            if (option === "remove") {
                section.classList.remove("show");
                button.classList.remove("active");
                ELEMENTS.delete(button);
            }
            if (option === "toggle") {
                section.classList.toggle("show");
                button.classList.toggle("active");
            }
        } else {
            const currentSection = target.closest("[data-click-section]");
            reset(currentSection, target, "default");
        }

        if (target.closest('.modal__close')) {
            const modal = target.closest('[data-click-section]');
            modal.classList.remove('show');
        }
    });

    window.addEventListener("keydown", (evt) => {
        const key = evt.key;

        if (key === "Escape") {
            ELEMENTS.forEach((item) => {
                const section = item[0];
                const button = item[1];
                const hasBody = item[2];
                const fixed = button.dataset.clickFixed ? true : false;

                if (fixed) return;

                section.classList.remove("show");
                button.classList.remove("active");
                ELEMENTS.delete(button);

                if (hasBody) {
                    removeClassFromBody(hasBody);
                }
            });
        }
    });
};

