export const setDatepicker = () => {
    const dateList = document.querySelectorAll('.is-date');
    dateList.forEach(date => {
        const evtChange = new Event('input', { bubbles: true});

        new AirDatepicker(date, {
            onSelect(obj) {
                obj.datepicker.$el.dispatchEvent(evtChange);
            },
            onShow() {
                window.isLastClickDatepicker = true;
            },
            onHide() {
                setTimeout(() => {
                    window.isLastClickDatepicker = false;
                }, 100);
            },
            autoClose: true,
            minDate: new Date(),
            range: true,
            classes: 'main-calendar',
        })
    });
};
