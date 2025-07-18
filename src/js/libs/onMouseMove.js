import { throttle } from "./throttle.js";

/**
 * Добавляет эффект параллакса при движении мыши для элементов с атрибутом `[data-mouse-move]`.
 * Каждый такой элемент может содержать дочерние элементы с атрибутом `[data-mouse-object]`,
 * которые будут плавно смещаться относительно положения курсора мыши,
 * создавая эффект глубины и движения.
 *
 * Скорость движения для каждого дочернего элемента задаётся через
 * атрибут `data-mouse-object` (числовое значение). Если значение не число, используется значение по умолчанию — 100.
 *
 * Обработчик событий мыши реализован с троттлингом для повышения производительности.
 * Анимация останавливается через 2 секунды после ухода мыши с элемента.
 *
 * @example
 * <div data-mouse-move>
 *   <div data-mouse-object="50"></div>
 *   <div data-mouse-object="150"></div>
 * </div>
 */
export const onMouseMove = () => {
    const elList = document.querySelectorAll('[data-mouse-move]');

    elList.forEach(el => {
        const objects = el.querySelectorAll('[data-mouse-object]');
        const objectsSpeed = Array.from(objects).map(item => item.dataset.mouseObject);
        let width = el.getBoundingClientRect().width / 2;
        let height = el.getBoundingClientRect().height / 2;
        let x = width + el.getBoundingClientRect().left;
        let y =  height + el.getBoundingClientRect().top;
        let raf = null;
        let inputX = 0;
        let inputY = 0;
        let timer = null;

        setTimeout(() => {
            width = el.getBoundingClientRect().width / 2;
            height = el.getBoundingClientRect().height / 2;
        }, 500);

        const starting = () => {
            x = x + (inputX - x) * 0.03;
            y = y + (inputY - y) * 0.03;
            objects.forEach((obj, i) => {
                const speed = isNaN(objectsSpeed[i]) ? 100 : objectsSpeed[i];

                obj.style.transform = `translate3d(${x / speed}px, ${y / speed}px, 0)`;
            });

            raf = requestAnimationFrame(starting);
        };

        starting();

        const throttleFunc = throttle((evt) => {
            clearTimeout(timer);

            inputX = evt.clientX - width - el.getBoundingClientRect().left;
            inputY = evt.clientY - height - el.getBoundingClientRect().top;

            if (!raf) {
                raf = requestAnimationFrame(starting);
            }

        }, 10);

        el.addEventListener('mousemove', (evt) => {
            throttleFunc(evt);
        });

        el.addEventListener('mouseleave', (evt) => {
            timer = setTimeout(() => {
                cancelAnimationFrame(raf);
                raf = null;
            }, 2000);
        });
    });
};
