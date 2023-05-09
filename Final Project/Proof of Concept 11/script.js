import { PitchDetector } from "https://esm.sh/pitchy@4";

const context = new AudioContext();
const analyser = context.createAnalyser();

const pitchElement = document.getElementById('pitch');
const clarityElement = document.getElementById('clarity');
const canvas = document.querySelector("canvas")
const canvasCtx = canvas.getContext('2d');

let pitchData = new Queue();
const qSize = 8;

let numFails = 0;
const scoreElement = document.getElementById('score');

//Y Position of the mouse
let posY = 0;

const audio = document.querySelector("audio");
const audioPlay = () => {
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    const dataArray = new Float32Array(analyser.fftSize);

    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    const input = new Float32Array(detector.inputLength);

    let minPitch = 0;
    let maxPitch = Number.MIN_SAFE_INTEGER;

    function updatePitch(analyserNode, detector, input, sampleRate) {
        analyserNode.getFloatTimeDomainData(input);
        const [pitch, clarity] = detector.findPitch(input, sampleRate);

        pitchElement.textContent = `${Math.round(pitch * 10) / 10
            } Hz`;
        clarityElement.textContent = "Clarity: " + `${Math.round(
            clarity * 100
        )} %`;
        
        const draw = () => {
            // Clear the canvas
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            //Line width for notes
            const lineW = 4;

            // Add the pitch to the pitchData array
            if (pitch !== null) {
                while (pitchData.size() >= qSize) {
                    pitchData.dequeue();
                }
                pitchData.enqueue(pitch);

                //Update the max pitch
                if (pitch > maxPitch) {
                    maxPitch = pitch;
                }
            }

            let pitchRange = maxPitch - minPitch;

            //Yellow rectangle for scoring area
            //canvasCtx.fillStyle = 'yellow';
            canvasCtx.fillStyle = "rgb(255,255,0)";
            canvasCtx.fillRect(0, 0, canvas.width / pitchData.size(), canvas.height);

            // Draw the lines for all the pitch data
            // Adjusted by the pitchRange
            for (let i = 1; i < pitchData.size(); i++) {
                const x1 = (i - 1) * canvas.width / pitchData.size();
                const x2 = i * canvas.width / pitchData.size();
                const elem = pitchData._elements[i + pitchData._offset];
                const y = canvas.height - (elem - minPitch) * canvas.height / pitchRange;
                //console.log("Element: " + pitchData._elements[i + pitchData._offset]);

                canvasCtx.beginPath();
                canvasCtx.moveTo(x1, y);
                canvasCtx.lineTo(x2, y);
                if (elem >= maxPitch / 2) {
                    //Higher frequency notes
                    //canvasCtx.strokeStyle = 'red';
                    canvasCtx.strokeStyle = "rgb(255,0,0)";
                } else {
                    //Lower frequency notes
                    //canvasCtx.strokeStyle = 'blue';
                    canvasCtx.strokeStyle = "rgb(0,0,255)";
                }
                canvasCtx.lineWidth = lineW;
                canvasCtx.stroke();
            }

            //Draw line for mouse indicator using its posY
            const segmentWidth = canvas.width / pitchData.size();
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, posY);
            canvasCtx.lineTo(segmentWidth, posY);
            //canvasCtx.strokeStyle = 'black';
            canvasCtx.strokeStyle = "rgb(0,0,0)";
            canvasCtx.lineWidth = lineW + 10;
            canvasCtx.stroke();

            // Get the image data for the canvas
            //const imageData = canvasCtx.getImageData(0, 0, 1, canvas.height);
            //const imageData = canvasCtx.getImageData(segmentWidth + 10, 1, 1, canvas.height);
            
            //Get a pixel on the 2nd segment to the right of the left of the canvas, at the same posY as the mouse
            const imageData = canvasCtx.getImageData(segmentWidth * 2, posY, 1, 1);
            //console.log("Composite operation: " + canvasCtx.globalCompositeOperation);
            // Loop over each pixel in the image data and count the number of red pixels
            
            const i = 0;
            //Get the rgb values for the pixel in the segment to the right
            const red = imageData.data[i];
            const green = imageData.data[i + 1];
            const blue = imageData.data[i + 2];
            
            //Tally up the fails
            if (red >= 1 && green === 0 && blue === 0) {
                //Red
                numFails++;
                console.log("Red seen");
            }
            else if (red === 0 && green === 0 && blue >= 1) {
                //Blue
                numFails++;
                console.log("Blue seen");
            }
            else if (red === 0 && green === 0 && blue === 0) {
                //Black
                //numFails++;
                console.log("Black seen");
            }
            else if (red >= 1 && green >= 1 && blue === 0) {
                //Yellow
                //numFails++;
                console.log("Yellow seen");
            }
            else{
                //numFails++;
                console.log("UNKNOWN COLOR SEEN! RGB: " + red + " " + green + " " + blue);
            }
            
            scoreElement.textContent = "Fails: " + numFails;

            // Request the next animation frame
            requestAnimationFrame(draw);
        };
        draw();

        // Sleep for 1000 ms
        window.setTimeout(
            () => updatePitch(analyserNode, detector, input, sampleRate),
            1000
        );
    }
    updatePitch(analyser, detector, input, context.sampleRate);
};

// Add a mousemove event listener to the canvas
canvas.addEventListener("mousemove", function (event) {
    // Get the current y position of the mouse relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    // Update the lineY variable to match the mouse position
    posY = mouseY;
});

const startButton = document.getElementById('toggleButton');
startButton.addEventListener('click', () => {
    if (audio.paused) {
        context.resume();
        audio.play();
        toggleButton.textContent = 'Pause';
    } else {
        audio.pause();
        toggleButton.textContent = 'Play';
    }
});

audio.addEventListener('play', () => {
    //Resize canvas when play button pressed
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
});

audio.addEventListener('ended', () => {
    console.log('Audio has ended');
});

//Popup instructions from week 11
const square = document.querySelector('.square');
const popupContainer = document.querySelector('.popup-container');
square.addEventListener('click', () => {
    // Show the popup when square is clicked
    popupContainer.style.visibility = 'visible';
    popupContainer.style.opacity = 1;
});

// Hide popup when container is clicked
popupContainer.addEventListener('click', () => {
    popupContainer.style.visibility = 'hidden';
    popupContainer.style.opacity = 0;
});

audioPlay();