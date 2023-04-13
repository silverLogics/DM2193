const squares = document.querySelectorAll('.square');
const popupContainer = document.querySelector('.popup-container');

// Loop through the squares and add a click event listener to each one
squares.forEach((square) => {
    square.addEventListener('click', () => {
        // Show the popup when square is clicked
        popupContainer.style.visibility = 'visible';
        popupContainer.style.opacity = 1;
    });
});

// Hide popup when container is clicked
popupContainer.addEventListener('click', () => {
    popupContainer.style.visibility = 'hidden';
    popupContainer.style.opacity = 0;
});


//Only block the first container
const squaresContainer = document.querySelector('.container');
const popup = document.querySelector('.popup');
const adBlockerButton = document.querySelector('#adBlocker');
const adblockMessage = document.querySelector('h2');
let isShowingSquares = true;

adBlockerButton.addEventListener('click', () => {
    if (isShowingSquares) {
        // Hide squares container and show adblock message
        squaresContainer.style.display = 'none';
        adblockMessage.style.display = 'block';
        isShowingSquares = false;
        adBlockerButton.textContent = 'uBlock Origin is On!';
    } else {
        // Hide adblock message and show squares container
        adblockMessage.style.display = 'none';
        squaresContainer.style.display = 'flex';
        isShowingSquares = true;
        adBlockerButton.textContent = 'uBlock Origin is Off!';
    }
});