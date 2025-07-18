import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

export const scrollGsap = () => {
    const tablet = matchMedia("(max-width: 1024px)");

    const initGsapAnimation = () => {
        /**
        * При попадании элемента в область видимости добавляется класс `is-show`,
        * при выходе — класс удаляется.
         */
        const squares = document.querySelectorAll('[data-show-up]');
        squares.forEach((square) => {
            ScrollTrigger.create({
                trigger: square, // Элемент, который отслеживаем
                start: "top center", // Начало: верх элемента в центре экрана
                end: "bottom center", // Конец: низ элемента в центре экрана
                onEnter: () => square.classList.add('is-show'), // Добавляем класс при входе
                onLeave: () => square.classList.remove('is-show'), // Удаляем класс при выходе
                onEnterBack: () => square.classList.add('is-show'), // Добавляем класс при входе с обратной стороны
                onLeaveBack: () => square.classList.remove('is-show'), // Удаляем класс при выходе обратно
            });
        });


        const decorLine = document.querySelectorAll('[data-decor-line]');
        decorLine.forEach(line => {
            const currentLine = line.querySelector('.decor-top-line');
            const containerHeight = line.getBoundingClientRect().height;
            if (currentLine) {
                const currentLineHeight = currentLine.getBoundingClientRect().height;

                ScrollTrigger.create({
                    trigger: line,
                    start: "top bottom-=350", // Начало скролла - верх контейнера
                    end: "center top", // Конец скролла - низ контейнера
                    scrub: true, // Включаем плавный переход
                    markers: false, // Убираем, если не нужны маркеры
                    onUpdate: (self) => {
                        const newY = self.progress * (containerHeight - currentLineHeight);
                        currentLine.style.top = newY + 'px'
                    }
                });
            }
        });

        const parallaxList = document.querySelectorAll('[data-parallax]');
        parallaxList.forEach(parallax => {
            const image = parallax.querySelector('img');

            if (image) {
                ScrollTrigger.create({
                    trigger: parallax,
                    start: "top bottom", // Начало скролла - верх контейнера
                    end: "bottom top", // Конец скролла - низ контейнера
                    scrub: true, // Включаем плавный переход
                    markers: false, // Убираем, если не нужны маркеры
                    onUpdate: (self) => {
                        const newY = self.progress * -30;
                        image.style.transform = `translate3d(0, ${newY}%, 0)`;
                    }
                });
            }
        });

        /**
         * Для каждого элемента с `data-scroll`:
         * - Анализируется медиазапрос из `data-scroll-media` (по умолчанию 'min-width: 769px').
         * - Если медиазапрос совпадает с текущим состоянием окна, запускается анимация GSAP `fromTo` с настройками из `data-scroll`.
         * - Если медиазапрос не совпадает, элементу устанавливаются конечные CSS-свойства из `data-scroll`.
         *
         * Формат атрибута `data-scroll`:
         * - Свойства и значения разделяются `;`
         * - Каждое свойство описывается как `cssProperty: fromValue,toValue` для анимации
         * - Можно указать `start` и `end` точки ScrollTrigger через `startPoint;endPoint` без значений (например, `top bottom;bottom top`)
         *
         * Атрибуты:
         * - `data-scroll-triger` — CSS-селектор или элемент для триггера ScrollTrigger (по умолчанию сам элемент).
         * - `data-scroll-media` — медиазапрос, например, 'min-width: 1024px'.
         *
         * Пример использования в HTML:
         * ```html
         * <div
         *   data-scroll="opacity: 0,1; y: 50,0; top bottom; bottom top"
         *   data-scroll-triger=".trigger-element"
         *   data-scroll-media="min-width: 768px">
         *   Контент
         * </div>
         * ```
         *
         * @requires gsap, gsap/ScrollTrigger
         * @returns {void}
         */
        const scrollEffect = document.querySelectorAll('[data-scroll]');
        scrollEffect.forEach(scroll => {
            const mediaCondition = scroll.dataset.scrollMedia || 'min-width: 769px';
            const [mediaType, mediaValue] = mediaCondition.split(':').map(val => val.trim());
            const mediaQuery = window.matchMedia(`(${mediaType}: ${mediaValue})`);

            function handleAnimation() {
                const shouldAnimate = mediaQuery.matches;

                if (shouldAnimate) {
                    const scrollData = scroll.dataset.scroll.split(';');
                    const triger = scroll.dataset.scrollTriger || scroll;

                    const from = {};
                    const to = {};
                    const startEnd = [];

                    scrollData.forEach(item => {
                        const [prop, values] = item.split(':');
                        if (values) {
                            const [fromValue, toValue] = values.split(',').map(val => val.trim());
                            from[prop.trim()] = fromValue;
                            to[prop.trim()] = toValue;
                        } else {
                            startEnd.push(prop.trim());
                        }
                    });

                    const start = startEnd.length > 0 ? startEnd[0] : 'top bottom';
                    const end = startEnd.length > 1 ? startEnd[1] : 'bottom top';

                    gsap.fromTo(scroll, from, {
                        ...to,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: triger,
                            start: start,
                            end: end,
                            scrub: 1,
                        }
                    });
                } else {
                    const scrollData = scroll.dataset.scroll.split(';');
                    const to = {};

                    scrollData.forEach(item => {
                        const [prop, values] = item.split(':');
                        if (values) {
                            const [, toValue] = values.split(',').map(val => val.trim());
                            to[prop.trim()] = toValue;
                        }
                    });

                    gsap.set(scroll, to);
                }
            }
            // Запускаем при загрузке
            handleAnimation();

            // Слушаем изменения размера окна
            mediaQuery.addEventListener('change', handleAnimation);
        });


        if (!tablet.matches) {
            const slides = document.querySelectorAll('.slides');

            slides.forEach(slide => {
                const cards = slide.querySelectorAll('.slides__item');

                cards.forEach((card,i) => {
                    if (i !== cards.length - 1) {
                        gsap.fromTo(card,
                            { scale: 1, filter: 'blur(0px)' },
                            {
                                scale: 0.8,
                                filter: 'blur(10px)',
                                scrollTrigger: {
                                    trigger: card,
                                    start: 'top top+=80',       // Начало анимации
                                    end: 'bottom top',      // Конец анимации
                                    scrub: true,            // Плавная анимация
                                }
                            }
                        );
                    }
                });
            });
        }
    };


    initGsapAnimation();
    setTimeout(() => {
        ScrollTrigger.refresh(true);
    }, 2000)
};
