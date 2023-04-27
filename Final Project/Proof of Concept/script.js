const button = document.querySelector('button');
const audio = document.querySelector('audio');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

button.textContent = 'Play';

function init() {
    // Create a new AudioContext and connect the audio player to it
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sourceNode = audioContext.createMediaElementSource(audio);

    // Create a new AnalyserNode and connect it to the source node
    const analyserNode = audioContext.createAnalyser();
    sourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    // Set the canvas width and height based on the audio duration
    const duration = audio.duration;
    canvas.width = duration * 100;
    canvas.height = 200;

    // Create a buffer to hold the waveform data
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Add an event listener to the button to toggle the play/pause state of the audio
    button.addEventListener('click', function () {
        if (audio.paused) {
            // If the audio is paused, play it and change the button text to "Pause"
            audioContext.resume().then(() => audio.play());
            button.textContent = 'Pause';
        } else {
            // If the audio is playing, pause it and change the button text to "Play"
            audio.pause();
            button.textContent = 'Play';
        }
    });

    // Draw the waveform
    function drawWaveform() {
        requestAnimationFrame(drawWaveform);

        // Get waveform data and clear the canvas
        analyserNode.getByteTimeDomainData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set the line style and draw the waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();

        const sliceWidth = canvas.width * 0.2 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
    }

    // Add an event listener to the audio to start drawing the waveform when it plays
    audio.addEventListener('play', function () {
        drawWaveform();
    });
}

// add an event listener to the audio to initialize the AudioContext and AnalyserNode when it loads
audio.addEventListener('loadedmetadata', function () {
    init();
});
