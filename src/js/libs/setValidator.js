import validator from 'validator';

const checkCorrectData = (input, condition) => {
    const parent = input.parentElement;

    if (condition) {
        parent.classList.remove('is-error');
        parent.classList.add('is-correct');
        input.classList.remove('is-error');
        input.classList.add('is-correct');
    } else {
        parent.classList.remove('is-correct');
        parent.classList.add('is-error');
        input.classList.remove('is-correct');
        input.classList.add('is-error');
    }
};

export const validate = () => {
    const formList = document.querySelectorAll('form');

    formList.forEach(form => {
        const submit = form.querySelector('button[type="submit"], input[type="submit"]')
        const inputList = Array.from(form.querySelectorAll('input[required], input.required'));
        let isCorrect = false;

        form.addEventListener('input', (evt) => {
            const input = evt.target;

            if (input.hasAttribute('required') || input.classList.contains('required')) {
                if (input.type === 'tel' || input.classList.contains('is-phone')) {
                    const phone = input.value;
                    const convertPhone = phone.replace(/[\s-()]/g, '');

                    checkCorrectData(input, validator.isMobilePhone(convertPhone, ['ru-RU'], {strictMode: true}));
                } else if (input.type === 'email') {
                    checkCorrectData(input, validator.isEmail(input.value));
                } else if (input.type === 'checkbox') {
                    checkCorrectData(input, input.checked);
                } else {
                    checkCorrectData(input, input.value.length > 0);
                }
            }

            isCorrect = inputList.find(currentInput => {
                if (currentInput.classList.contains('is-error') ||
                    currentInput.value.length === 0 ||
                    currentInput.type === 'checkbox' && !currentInput.checked) {
                    return currentInput;
                }
            });

            if (isCorrect) {
                form.classList.remove('is-correct');
                form.classList.add('is-error');
            } else {
                form.classList.remove('is-error');
                form.classList.add('is-correct');
            }
        })
    });
};
