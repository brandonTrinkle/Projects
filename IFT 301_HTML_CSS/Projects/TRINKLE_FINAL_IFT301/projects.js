let projectImages = [
    ['Outside/image0.jpeg', 'Outside/image1.jpeg', 'Outside/image3.jpeg', 'Outside/image4.jpeg', 'Outside/image5.jpeg', 'Outside/image6.jpeg', 'Outside/image8.jpeg', 'Outside/image9.jpeg'],
    ['Custom/IMG_0091.jpg', 'Custom/IMG_0106.jpg', 'Custom/IMG_0107.jpg', 'Custom/IMG_0116.jpg', 'Custom/IMG_0119.jpg', 'Custom/IMG_0128.jpg', 'Custom/IMG_0129.jpg', 'Custom/IMG_0130.jpg', 'Custom/IMG_0131.jpg', 'Custom/IMG_3360.JPG'],
    ['Inside/IMG_3394.JPG', 'Inside/IMG_3395.JPG', 'Inside/IMG_3396.JPG', 'Inside/IMG_3397.JPG', 'Inside/IMG_3400.JPG', 'Inside/IMG_3401.JPG', 'Inside/IMG_3402.JPG']
];

let currentProjectIndex = 0;
let currentImageIndex = 0;

function openLightbox(projectIndex) {
    console.log("Opening lightbox for project: " + projectIndex);
    currentProjectIndex = projectIndex - 1;
    currentImageIndex = 0;
    updateLightboxImage();
    document.getElementById('lightbox').style.display = 'flex';
}

function changeImage(direction) {
    let totalImages = projectImages[currentProjectIndex].length;
    currentImageIndex = (currentImageIndex + direction + totalImages) % totalImages;
    console.log("Current image index after change: " + currentImageIndex);
    updateLightboxImage();
}

function updateLightboxImage() {
    document.getElementById('lightbox-img').src = projectImages[currentProjectIndex][currentImageIndex];
    console.log("Updated lightbox image to: " + document.getElementById('lightbox-img').src);
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function closeLightbox(event) {
    if (event.target.className === 'lightbox' || event.target.className === 'close-btn') {
        document.getElementById('lightbox').style.display = 'none';
    }
}
