const getSize = (size) => {
    const MB = 1024 * 1024;
    const GB = 1024 * 1024 * 1024;

    if (size < MB) {
        return Math.trunc(size / 1024) + ' кб';
    }
    if (size < GB && size >= MB) {
        return Math.trunc(size / MB) + ' мб';
    }
    if (size >= GB) {
        return Math.trunc(size / GB) + ' гб';
    }
};

const onInputChange = (evt, inputParent) => {
    const target = evt.target || evt;
    const quantity = target.files.length;
    const textSpace = inputParent.querySelector('[data-file-content]');

    if (!textSpace || quantity === 0) return;

    if (evt.target) {
        inputParent.querySelectorAll('[data-file-content]').forEach(item => {
            if(item !== textSpace) {
                item.remove();
            } else {
                textSpace.removeAttribute('style');
            }
        })
    }

    inputParent.classList.add('is-has-file');

    for (let i = 0; i < quantity; i++) {
        const file = target.files[i];
        const weight = getSize(file.size);
        const cloneText = textSpace.cloneNode(true);
        const text = cloneText.querySelector('[data-file-text]');
        const weightTag = cloneText.querySelector('[data-file-weight]');
        const exeFile = cloneText.querySelector('[data-file-exe]');
        const removeBtn = cloneText.querySelector('[data-file-remove]');
        const image = cloneText.querySelector('[data-file-image]');


        if (image) {
            image.src = URL.createObjectURL(file);
        }

        if (text) {
            text.textContent = file.name;
        }
      
        if (exeFile) {
            exeFile.textContent = file.name.split('.').pop();
        }

        if (weightTag) {
            weightTag.textContent = weight;
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                const dataTransfer = new DataTransfer();
                const arrayFiles = Array.from(target.files);
                let currentIndex = i;

                arrayFiles.forEach((currentFile, index) => {
                    if (currentFile === file) {
                        currentIndex = index;
                    }
                });
                arrayFiles.splice(currentIndex, 1);
                arrayFiles.forEach(file => {
                    dataTransfer.items.add(file);
                });

                target.files = dataTransfer.files;
                cloneText.remove();

                if (target.files.length === 0) {
                    textSpace.removeAttribute('style');
                    inputParent.classList.remove('is-has-file');
                }
            });
        }

        textSpace.after(cloneText);
    }

    textSpace.style.display = 'none';
};

const setInputFile = () => {
    const listInput = document.querySelectorAll('[data-file-parent]');

    listInput.forEach(inputParent => {
        const input = inputParent.querySelector('[type="file"]');
        if (!input) return;

        onInputChange(input, inputParent);

        input.addEventListener('change', (evt) => {
            onInputChange(evt, inputParent);
        });
    });
};

setInputFile();