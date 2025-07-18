const getScrollbarWidth = () => {
    return window.innerWidth - document.documentElement.clientWidth;
};

export const observeBody = (arr) => {
    if (!arr[0]) return;

    let scrollbarWidth = getScrollbarWidth();
    const BODY = document.body;
    BODY.style.setProperty(`--base-scroll`, scrollbarWidth + 'px');

    const setBodyClass = (target) => {
        for (let i = 0; i < arr.length; i++) {
            let cls = arr[i];
            let condition = target.classList.contains(cls);

            if (arr[i].includes('!')) {
                cls = arr[i].slice(1);
                condition = !target.classList.contains(cls);
            } else {
                cls = arr[i];
                condition = target.classList.contains(cls);
            }

            if (condition) {
                BODY.style.setProperty(`--scroll-width`, scrollbarWidth + 'px');
                break;
            } else {
                BODY.style.setProperty(`--scroll-width`, 0);
            }
        }
    }

    const observer = new MutationObserver((list) => {
        list.forEach(item => {
            const target = item.target;

            if (item.attributeName !== 'class') return;

            setBodyClass(target);
        });
    });

    observer.observe(BODY, {
        attributes: true,
    });
    setBodyClass(BODY);
};

