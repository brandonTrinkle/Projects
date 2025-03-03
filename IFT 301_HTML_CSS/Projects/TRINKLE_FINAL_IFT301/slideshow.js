document.addEventListener('DOMContentLoaded', function() {
    initializeSlideshows();
});

function initializeSlideshows() {
    let slideshows = document.getElementsByClassName("slideshow-container");
    Array.from(slideshows).forEach(slideshow => {
        let slides = slideshow.getElementsByClassName("mySlides");
        slides[0].style.display = 'block';
        slideshow.setAttribute('data-current-slide', 0);
    });
}

function plusSlides(n, slideshow) {
    let slides = slideshow.getElementsByClassName("mySlides");
    let currentSlideIndex = parseInt(slideshow.getAttribute('data-current-slide')) || 0;

    let currentSlide = slides[currentSlideIndex];
    let nextSlideIndex = (currentSlideIndex + n + slides.length) % slides.length;
    let nextSlide = slides[nextSlideIndex];


    currentSlide.classList.remove('active');
    currentSlide.style.opacity = 0;

    // Set a short timeout to begin fade in
    setTimeout(() => {
        currentSlide.style.display = 'none';

        // Prepare the next slide
        nextSlide.style.display = 'block';
        nextSlide.style.opacity = 0; 
        setTimeout(() => {
            nextSlide.classList.add('active');
            nextSlide.style.opacity = 1; 
        }, 20);

        // Update the current slide index
        slideshow.setAttribute('data-current-slide', nextSlideIndex);
    }, 600); // Matches the transition duration
}
