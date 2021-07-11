import image from './images/lazy.png';

const subHeader = document.createElement('h2');
subHeader.innerHTML = 'This elements was created by js';

const myImage = new Image();
myImage.src = image;

document.body.appendChild(subHeader);
document.body.appendChild(myImage);
