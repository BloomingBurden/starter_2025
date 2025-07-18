export class makeQuiz {
    constructor(selector) {
        this.el = document.querySelector(selector);
        if(!this.el) return;

        this.wrapper = this.el.querySelector('.quiz__slides');
        this.slides = this.wrapper.querySelectorAll('.quiz__slide');
        this.navigation = this.el.querySelectorAll('.quiz__navigation_button');

        if(!this.slides) return;

        this.init();
    }

    init() {
        this.slides.forEach(slide => {
            
        });

        this.slides[0].classList.add('active');
        this.setNavigation();
    }

    setNavigation() {
        this.navigation.forEach((el) => {
            el.addEventListener('click', () => {
                if(el.classList.contains('quiz__navigation_next')) {
                    const currentSlide = this.wrapper.querySelector('.quiz__slide.active');
                    currentSlide.nextElementSibling.classList.add('active');
                    currentSlide.classList.remove('active')

                } else {
                    const currentSlide = this.wrapper.querySelector('.quiz__slide.active');
                    currentSlide.previousElementSibling.classList.add('active');
                    currentSlide.classList.remove('active')
                    
                }
            })
        })
    }
}