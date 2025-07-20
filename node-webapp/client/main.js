const micBtn = document.getElementById('micBtn');
const statusStar = document.getElementById('statusStar');
const speaker = document.getElementById('speaker');
const speakerActive = document.getElementById('speakerActive');

let mediaRecorder;
const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = (event) => {
  const blob = new Blob([event.data], { type: 'audio/webm' });
  const audio = new Audio(URL.createObjectURL(blob));

  micBtn.disabled = true;
  speaker.classList.add('hidden');
  speakerActive.classList.remove('hidden');

  audio.onended = () => {
    micBtn.disabled = false;
    speaker.classList.remove('hidden');
    speakerActive.classList.add('hidden');
  };

  audio.onerror = () => {
    micBtn.disabled = false;
    speaker.classList.remove('hidden');
    speakerWaves.classList.add('hidden');
  };

  audio.play();
};

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
        ws.send(e.data);
      }
    };

    micBtn.onmousedown = () => {
      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        micBtn.classList.add('recording');
        statusStar.classList.remove('hidden');
      }
    };

    micBtn.onmouseup = () => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        micBtn.classList.remove('recording');
        statusStar.classList.add('hidden');
      }
    };

    micBtn.ontouchstart = micBtn.onmousedown;
    micBtn.ontouchend = micBtn.onmouseup;
  })
  .catch(err => {
    micBtn.disabled = true;
    micBtn.textContent = 'Mic unavailable';
    console.error('Mic error:', err);
  });
