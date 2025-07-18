import IMask from 'imask';
import "./polyfills.js";
import { onClickBtn } from "./libs/onClickBtn.js";
import { setSwipers } from "./libs/setSwiper.js";
import { validate } from './libs/setValidator.js';
import { lazyLoadElements } from './libs/lazyLoad.js';
import { scrollGsap } from './libs/setGsap.js';
import { observeBody } from './libs/observeBody.js';
import { onScroll } from './libs/onScroll.js';
import { CustomSearch } from './libs/customSearch.js';
import { setDatepicker } from './libs/setDatePick.js';
import { CustomSelect } from './libs/customSelect.js';

// import "./libs/customFormFile.js";
// import { Fancybox } from "@fancyapps/ui";
// import "../../node_modules/swiped-events/dist/swiped-events.min.js";

/* Тут можно писать код общий для всего проекта и требующий единого пространства имен */

let lastWidth = 0;

const setMaskPhone = () => {
    const phoneList = document.querySelectorAll('.is-phone');
    phoneList.forEach(phone => {
        IMask(
            phone,
            {
              mask: '+{7} (000) 000-00-00',
              prepare: (value, maskEl) => {
                // Если пользователь вводит 8, заменяем её на +7
                if (value.startsWith('8') && maskEl.value.length === 0) {
                    return value.replace(/^8/, '+7');
                }
                return value;
            }
            }
          )
    });
};

const fixFullheight = () => {
    let vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    lastWidth = innerWidth;
};

document.addEventListener('DOMContentLoaded', () => {
    observeBody(['no-scrolling']);
    onClickBtn();
    fixFullheight();
    setSwipers();
    setMaskPhone();
    validate();
    lazyLoadElements();
    scrollGsap();
    
    // setDatepicker
    // new CustomSelect(document.querySelector('.select'));
    // new CustomSearch(document.querySelector('[data-search]'));
    // onScroll();
    // Fancybox.bind("[data-fancybox]");

    const setFilled = (input, parent) => {
        parent.classList.toggle('filled', input.value.trim() !== '');
    };
    document.querySelectorAll('.input, .textarea').forEach(parent => {
        const input = parent.querySelector('input, textarea');

        if (!input )return;
        setFilled(input, parent);

        input.addEventListener('input', () => {
            setFilled(input, parent);
        });
        input.addEventListener('change', () => {
            setFilled(input, parent);
        });
    })
});

window.addEventListener('resize', () => {
    if (innerWidth !== lastWidth) {
        fixFullheight();
    }
});