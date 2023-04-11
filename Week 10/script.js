console.log("Script start");

const horses = document.querySelectorAll('.horse');
const runButton = document.querySelector('button');
const header = document.querySelector('h1');

const fontFamilies = ['Arial', 'Times New Roman', 'Verdana'];

let currentFontIndex = Math.floor(Math.random() * (fontFamilies.length - 1));
header.style.fontFamily = fontFamilies[currentFontIndex];

runButton.addEventListener('click', function() {
    horses.forEach(horse => {
        horse.style.animation = 'none'; // Reset the animation
        horse.offsetHeight; // Trigger a reflow to force the reset to apply
        //Generate random delay between 2 and 6 seconds
        let speed = Math.floor(Math.random() * 4) + 2; 
        // Start the animation again
        horse.style.animation = `run ${speed}s linear`;
        /*horse.style.animationDuration = speed + "s";
        horses[i].style.animationDuration = speed + "s";
        horse.style.animationDuration = `${Speed}s`;
        */
    });
    
    header.style.fontFamily = fontFamilies[currentFontIndex];
    currentFontIndex = (currentFontIndex + 1) % fontFamilies.length;
    console.log('runButton');
});

console.log('Script fin');