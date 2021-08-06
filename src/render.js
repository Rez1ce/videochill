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

}


