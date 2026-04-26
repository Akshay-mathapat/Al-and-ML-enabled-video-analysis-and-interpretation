// Dashboard Interactions

function togglePlay(videoId) {
  const video = document.getElementById(videoId);
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Start All / Stop All
  const btnStartAll = document.getElementById('btnStartAll');
  const btnStopAll = document.getElementById('btnStopAll');
  const videos = document.querySelectorAll('video');

  if (btnStartAll) {
    btnStartAll.addEventListener('click', () => {
      videos.forEach(v => v.play());
    });
  }

  if (btnStopAll) {
    btnStopAll.addEventListener('click', () => {
      videos.forEach(v => v.pause());
    });
  }

  // Simulate Anomaly Detection Bounding Box on Video 2
  const vid2 = document.getElementById('vid2');
  const bbox2 = document.getElementById('bbox2');

  if (vid2 && bbox2) {
    vid2.addEventListener('timeupdate', () => {
      // Mock detection logic based on video playback time
      if (vid2.currentTime > 2 && vid2.currentTime < 8) {
        bbox2.style.display = 'block';
        // Randomize position slightly to simulate tracking
        const top = 30 + Math.sin(vid2.currentTime * 2) * 5;
        const left = 40 + Math.cos(vid2.currentTime * 2) * 5;
        bbox2.style.top = `${top}%`;
        bbox2.style.left = `${left}%`;
        bbox2.style.width = '15%';
        bbox2.style.height = '30%';
      } else {
        bbox2.style.display = 'none';
      }
    });
  }
});
