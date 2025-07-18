import { throttle } from "./throttle.js";


let lastScroll = 0;

const checkHeaderPos = () => {

    lastScroll = scrollY;
};

export const onScroll = () => {
    const throttleHeaderPos = throttle(checkHeaderPos, 20);
    window.addEventListener('scroll', () => {
        throttleHeaderPos();
    });
};
