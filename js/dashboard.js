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

  // Simulate Anomaly Detection Bounding Box removed (now handled by backend MJPEG stream)

  // Connect to WebSocket for real-time alerts
  const ws = new WebSocket('ws://' + window.location.host + '/ws/alerts');
  ws.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    const container = document.getElementById('alertsContainer');
    const fullTable = document.getElementById('fullAlertsTableBody');
    
    const isWarning = alert.level === 'warning';
    const isHigh = alert.level === 'high';
    const styleStr = isWarning ? 'style="border-left-color: var(--accent-warning); background: rgba(245, 158, 11, 0.05);"' : 
                     isHigh ? 'style="border-left-color: var(--accent-danger); background: rgba(239, 68, 68, 0.05);"' : '';
    
    if (container && (isWarning || isHigh)) {
      const html = `
        <div class="alert-item animate-fade-in" ${styleStr}>
          <div class="alert-time">${alert.time}</div>
          <div>
            <strong>${alert.title}</strong>
            <div style="color: var(--text-secondary); font-size: 0.8rem;">${alert.description}</div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('afterbegin', html);
      if (container.children.length > 5) container.lastElementChild.remove();
    }
    
    if (fullTable) {
      const tableLevelHtml = alert.level === 'high' ? '<span style="color: var(--accent-danger);">High</span>' : 
                             alert.level === 'warning' ? '<span style="color: var(--accent-warning);">Warning</span>' : 
                             '<span style="color: var(--text-muted);">Info</span>';
      const rowHtml = `
        <tr class="animate-fade-in">
          <td>${alert.time}</td>
          <td>${tableLevelHtml}</td>
          <td>${alert.title}</td>
          <td>${alert.description}</td>
        </tr>
      `;
      fullTable.insertAdjacentHTML('afterbegin', rowHtml);
    }
  };

  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        const modelBadge = document.querySelector('.topbar-actions .status-badge');
        if (modelBadge) {
          modelBadge.textContent = 'Model: ' + data.model;
        }
        
        const latencySpan = document.querySelector('.workspace-controls span');
        if (latencySpan) {
          latencySpan.textContent = data.latency_ms + 'ms';
        }
        
        const connBadge = document.querySelector('.sidebar-footer .status-badge');
        if (connBadge) {
          connBadge.innerHTML = '<span class="status-dot"></span> ' + data.connection;
        }
      }
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  }

  // Initial fetch and set interval for updates
  fetchStatus();
  setInterval(fetchStatus, 5000);  // refresh every 5s

  // SPA Navigation Logic
  const navItems = document.querySelectorAll('.nav-item[id^="nav-"]');
  const viewSections = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      viewSections.forEach(view => view.classList.remove('active'));

      item.classList.add('active');

      const targetViewId = item.id.replace('nav-', 'view-');
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });

  // Heatmap Radar Animation
  const canvas = document.getElementById('radar-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let angle = 0;

    function drawRadar() {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy) - 10;

      ctx.fillStyle = 'rgba(10, 11, 16, 0.1)';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      
      const grad = ctx.createLinearGradient(0, 0, 0, -r);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.8)');
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r/4, -r);
      ctx.lineTo(-r/4, -r);
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -r);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      if (Math.random() > 0.95) {
        const hx = cx + (Math.random() * 2 - 1) * r * 0.8;
        const hy = cy + (Math.random() * 2 - 1) * r * 0.8;
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
      }
      ctx.shadowBlur = 0;

      angle += 0.03;
      requestAnimationFrame(drawRadar);
    }
    drawRadar();
  }

  // Settings Form Logic
  const settingsForm = document.getElementById('modelSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const confidence = document.getElementById('confidence').value;
      const nms_threshold = document.getElementById('nms_threshold').value / 100;
      const model_type = document.getElementById('model_type').value;

      const btn = settingsForm.querySelector('button');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Saving...';

      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            confidence: parseInt(confidence),
            nms_threshold: parseFloat(nms_threshold),
            model_type: model_type
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Settings successfully updated!');
        } else {
          alert('Failed to save settings.');
        }
      } catch (err) {
        console.error(err);
        alert('Connection error.');
      }
      btn.innerHTML = originalText;
    });
  }

  // --- New Logic for Video Uploads & Source Selection ---
  const cam1Source = document.getElementById('cam1Source');
  const cam2Source = document.getElementById('cam2Source');
  const vid1 = document.getElementById('vid1');
  const vid2 = document.getElementById('vid2');

  async function loadVideos() {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const videos = await res.json();
        
        const updateSelect = (selectElem, currentVal) => {
          if (!selectElem) return;
          selectElem.innerHTML = '';
          videos.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.path;
            opt.textContent = v.name;
            selectElem.appendChild(opt);
          });
          // Restore selected value if it exists in the new list
          if (videos.find(v => v.path === currentVal)) {
            selectElem.value = currentVal;
          }
        };

        updateSelect(cam1Source, cam1Source ? cam1Source.value : '');
        updateSelect(cam2Source, cam2Source ? cam2Source.value : '');
      }
    } catch (e) {
      console.error('Failed to load videos', e);
    }
  }

  if (cam1Source && vid1) {
    cam1Source.addEventListener('change', (e) => {
      vid1.src = '/api/stream/cam1?video=' + encodeURIComponent(e.target.value);
    });
  }

  if (cam2Source && vid2) {
    cam2Source.addEventListener('change', (e) => {
      vid2.src = '/api/stream/cam2?video=' + encodeURIComponent(e.target.value);
    });
  }

  const uploadForm = document.getElementById('uploadVideoForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('videoFile');
      if (!fileInput.files.length) return;

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const btn = uploadForm.querySelector('button');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Uploading...';

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          alert('Video uploaded successfully!');
          fileInput.value = ''; // clear
          loadVideos(); // Refresh dropdowns
        } else {
          alert('Upload failed.');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload connection error.');
      }
      btn.innerHTML = originalText;
    });
  }

  // Load available videos on startup
  loadVideos();

  // --- Watchlist Logic ---
  const watchlistGrid = document.getElementById('watchlistGrid');
  async function loadWatchlist() {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        if (watchlistGrid) {
          watchlistGrid.innerHTML = '';
          data.forEach(item => {
            const card = `
              <div style="width: 120px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <img src="${item.image}" style="width: 100%; height: 120px; object-fit: cover;">
                <div style="padding: 0.5rem; text-align: center; font-size: 0.8rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.name}</div>
              </div>
            `;
            watchlistGrid.insertAdjacentHTML('beforeend', card);
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  const uploadWatchlistForm = document.getElementById('uploadWatchlistForm');
  if (uploadWatchlistForm) {
    uploadWatchlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('suspectName').value;
      const fileInput = document.getElementById('suspectPhoto');
      if (!fileInput.files.length) return;

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      const btn = uploadWatchlistForm.querySelector('button');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Adding...';

      try {
        const res = await fetch('/api/watchlist/upload?name=' + encodeURIComponent(name), {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          alert('Suspect added to Watchlist!');
          fileInput.value = '';
          document.getElementById('suspectName').value = '';
          loadWatchlist();
        } else {
          const err = await res.json();
          alert('Error: ' + err.detail);
        }
      } catch (err) {
        console.error(err);
        alert('Connection error.');
      }
      btn.innerHTML = originalText;
    });
  }

  loadWatchlist();
});
