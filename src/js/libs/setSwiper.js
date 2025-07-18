import Swiper from 'swiper/bundle';


export const setSwipers = () => {
    const tablet = window.matchMedia("(max-width: 780px)");
    const xlg = window.matchMedia("(max-width: 1280px)");

    new Swiper('.leaders__swiper', {
        slidesPerView: 'auto',
        breakpoints: {
            320: {
                spaceBetween: 8,
            },
            1024: {
                spaceBetween: 24,
            }
        },
        pagination: {
            el: document.querySelector('.leaders__pagination'),
            type: 'custom', // Кастомная пагинация
            clickable: true,
            renderCustom: function (swiper, current, total) {
                return `${current}/${total}`; // Формат пагинации, например, 1/2
            },
        },
        navigation: {
            nextEl: document.querySelector('.leaders__next'),
            prevEl: document.querySelector('.leaders__prev'),
        },
    });
};