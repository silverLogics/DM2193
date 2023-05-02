import { PitchDetector } from "https://esm.sh/pitchy@4";

const context = new AudioContext();
const analyser = context.createAnalyser();

const pitchElement = document.getElementById('pitch');
const clarityElement = document.getElementById('clarity');
const canvas = document.querySelector("canvas")
const canvasCtx = canvas.getContext('2d');

let pitchData = [];

const audio = document.querySelector("audio");
audio.addEventListener('canplay', () => {
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    const dataArray = new Float32Array(analyser.fftSize);
    function updatePitch(analyserNode, detector, input, sampleRate) {
        //while (true) {
            analyserNode.getFloatTimeDomainData(input);
            const [pitch, clarity] = detector.findPitch(input, sampleRate);
            console.log(pitch);

            pitchElement.textContent = `${Math.round(pitch * 10) / 10
                } Hz`;
            clarityElement.textContent = `${Math.round(
                clarity * 100
            )} %`;

            const draw = () => {
                // Clear the canvas
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                let minPitch = 27;
                let maxPitch = 4186;
                // Add the pitch to the pitchData array
                if (pitch !== null) {
                    pitchData.push(pitch);
                }

                let pitchRange = maxPitch - minPitch;

                // Draw the lines for all the pitch data
                // Adjusted by the pitchRange
                for (let i = 1; i < pitchData.length; i++) {
                    const x1 = (i - 1) * canvas.width / pitchData.length;
                    const x2 = i * canvas.width / pitchData.length;
                    const y = canvas.height - (pitchData[i] - minPitch) * canvas.height / pitchRange;

                    canvasCtx.beginPath();
                    canvasCtx.moveTo(x1, y);
                    canvasCtx.lineTo(x2, y);
                    canvasCtx.strokeStyle = 'red';
                    canvasCtx.lineWidth = 4;
                    canvasCtx.stroke();
                }

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
    console.log('Hi');
    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    const input = new Float32Array(detector.inputLength);

    updatePitch(analyser, detector, input, context.sampleRate);
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
});