/**
 * Инициализирует ленивую загрузку для всех элементов с атрибутами `data-src` и/или `data-srcset`.
 *
 * Поддерживает:
 * - <img> с src и srcset
 * - <picture> с <source data-srcset> и <img data-src/data-srcset>
 * - <video> с src
 * - <video><source data-src></video>
 *
 * Добавляет класс `is-load` после успешной загрузки ресурса.
 *
 * Пример:
    <picture>
        <source data-srcset="img-768.jpg" media="(max-width: 768px)">
        <source data-srcset="img-1024.jpg" media="(max-width: 1024px)">
        <img data-src="fallback.jpg" alt="Responsive image" />
    </picture>
 * 
 * @function lazyLoadElements
 * @returns {void}
 */
export const lazyLoadElements = () => {
    const lazyLoadElements = document.querySelectorAll('[data-src], [data-srcset]');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            const target = entry.target;

            if (!entry.isIntersecting) return;

            let child = target.querySelector('img, video, picture') || target;

            // Если это <picture>
            if (child.tagName === 'PICTURE') {
                const img = child.querySelector('img');
                const sources = child.querySelectorAll('source[data-srcset]');

                sources.forEach(source => {
                    if (source.dataset.srcset) {
                        source.srcset = source.dataset.srcset;
                    }
                });

                if (img) {
                    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
                    if (img.dataset.src) img.src = img.dataset.src;

                    const onLoad = () => {
                        target.classList.add('is-load');
                        img.removeEventListener('load', onLoad);
                    };
                    img.addEventListener('load', onLoad);
                }
            }

            // Если это <img>
            else if (child.tagName === 'IMG') {
                if (child.dataset.srcset) child.srcset = child.dataset.srcset;
                if (child.dataset.src) child.src = child.dataset.src;

                const onLoad = () => {
                    target.classList.add('is-load');
                    child.removeEventListener('load', onLoad);
                };
                child.addEventListener('load', onLoad);
            }

            // Если это <video>
            else if (child.tagName === 'VIDEO') {
                const sources = child.querySelectorAll('source[data-src]');
                sources.forEach(source => {
                    if (source.dataset.src) {
                        source.src = source.dataset.src;
                    }
                });

                if (child.dataset.src) child.src = child.dataset.src;

                child.load();

                const onLoaded = () => {
                    target.classList.add('is-load');
                    child.removeEventListener('loadeddata', onLoaded);
                };
                child.addEventListener('loadeddata', onLoaded);
            }

            observer.unobserve(target);
        });
    }, {
        rootMargin: '350px',
        threshold: 0,
    });

    lazyLoadElements.forEach(item => {
        observer.observe(item);
    });
};
