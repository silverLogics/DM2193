const context = new AudioContext();
const analyser = context.createAnalyser();

const audio = document.getElementById('audio');
audio.addEventListener('canplay', () => {
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
});

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    context.resume();
    audio.play();
    const dataArray = new Float32Array(analyser.fftSize);

    const updatePitch = () => {
        analyser.getFloatTimeDomainData(dataArray);
        const pitch = getPitch(dataArray);
        document.getElementById('pitch').textContent = pitch ? `${pitch.toFixed(1)} Hz` : '';
        requestAnimationFrame(updatePitch);
    };

    updatePitch();
    startButton.disabled = true;
});

const getPitch = (dataArray) => {
    const buffer = new Float32Array(dataArray.length * 2);
    buffer.set(dataArray);
    const pitch = autoCorrelate(buffer, context.sampleRate);
    return pitch;
};

const autoCorrelate = (buffer, sampleRate) => {
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;
    let foundGoodCorrelation = false;
    const correlations = new Array(MAX_SAMPLES);

    for (let i = 0; i < SIZE; i++) {
        const val = buffer[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) {
        return -1;
    }

    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
        let correlation = 0;
        for (let i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
        }
        correlation = 1 - (correlation / MAX_SAMPLES);
        correlations[offset] = correlation;
        if ((correlation > 0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestOffset = offset;
            }
        } else if (foundGoodCorrelation) {
            const shift = (correlations[bestOffset + 1] - correlations[bestOffset] - correlations[bestOffset - 1]) /
                (2 * correlations[bestOffset] - correlations[bestOffset - 1] - correlations[bestOffset + 1]);
            return sampleRate / (bestOffset + shift);
        }
        lastCorrelation = correlation;
    }
    if (bestCorrelation > 0.01) {
        return sampleRate / bestOffset;
    }
    return -1;
};