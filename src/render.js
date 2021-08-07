// Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('VideoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

// Node.js modules
const { desktopCapturer} = require('@electron/remote');

const { Menu } = require('@electron/remote');

// Get available videos
async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

let mediaRecorder; // Capture footage
const recordedChunks = [];

// Change videoSource window to record
async function selectSource(source){
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

// Create stream
const stream = await navigator.mediaDevices.getUserMedia(constraints);

// Preview the source in a video
videoElement.srcObject = stream;
videoElement.play();


// Create media recorder
const options = { mimeType: 'video/webm; codecs=vp9' };
mediaRecorder = new MediaRecorder(stream, options);

// Register event handlers
mediaRecorder.ondataavailable = handlerDataAvailable;
mediaRecorder.onstop = handlerStop;

}
// Capture all chunks
function handlerDataAvailable(e){
    console.log('video data available');
    recordedChunks.push(e.data);
}

const { dialog } = require('@electron/remote');
const { writeFile } = require('fs');
// Saves video file on stop
async function handlerStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Intl.DateTimeFormat().format(Date.now())}.webm`
    });

    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('video saved!'));

}

startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};
