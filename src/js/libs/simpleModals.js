// --- Простые модальные окна для сайта --- //
// import { openModal, closeModal, toggleModal, openButtons, eventsModal } from "../../js/libs/simpleModals";

import scrollLock from 'scroll-lock';

export const openButtons = () => {
    const openButtons = document.querySelectorAll('[data-modal-open]');
    openButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();


            let selector = button.dataset.modalOpen;
            if(typeof selector != "object") selector = document.querySelector(selector);

            openModal(button.dataset.modalOpen);
        })
    })
}

export const eventsModal = () => {

    document.querySelectorAll('[data-modal-close]').forEach((button) => {
        button.addEventListener('click', (e) => {
            console.log()
            closeModal('.modal.active');
        })
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            closeModal('.modal.active');
        }
    })

    document.addEventListener('click', (e) => {
        if(e.target === document.querySelector('.modal.active')) {
            closeModal('.modal.active');
        }
    });

}

export const openModal = (selector) => {
    if(typeof selector != "object") selector = document.querySelector(selector);

    selector.classList.add('active'); 
    scrollLock.disablePageScroll();
};

export const closeModal = (selector) => {
    if(typeof selector != "object") selector = document.querySelector(selector);

    resetPosition(selector.querySelector('.modal__container'))

    selector.classList.remove('active'); 
    scrollLock.enablePageScroll();
};

export const toggleModal = (selector) => {
    if(typeof selector != "object") selector = document.querySelector(selector);

    selector.classList.toggle('active'); 

    if(modal.classList.contains('active')) {
        scrollLock.disablePageScroll();
    } else {
        scrollLock.enablePageScroll();
    }
};

export const setStickyModal = (selector) => {
    if(typeof selector != "object") selector = document.querySelector(selector);

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    selector.addEventListener('mousedown', (e) => {
        if (!selector.classList.contains('active')) {
            selector.classList.add('active');
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const transform = selector.style.transform.match(/translate\((.*)px, (.*)px\)/);
        offsetX = transform ? parseFloat(transform[1]) : 0;
        offsetY = transform ? parseFloat(transform[2]) : 0;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        selector.style.transform = `translate(${offsetX + dx}px, ${offsetY + dy}px)`;
    }

    function onMouseUp() {
        isDragging = false;
        
        if (!selector.classList.contains('active')) {
            resetPosition();
        }

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

const resetPosition = (selector) => {
    if(typeof selector != "object") selector = document.querySelector(selector);
    selector.style.transform = 'translate(0px, 0px)';
}