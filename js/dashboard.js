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

  // Fetch dynamic alerts and status from backend
  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const alerts = await res.json();
        const container = document.getElementById('alertsContainer');
        const fullTable = document.getElementById('fullAlertsTableBody');
        
        if (container) container.innerHTML = ''; // Clear hardcoded
        if (fullTable) fullTable.innerHTML = '';
        
        alerts.forEach(alert => {
          const isWarning = alert.level === 'warning';
          const isHigh = alert.level === 'high';
          const styleStr = isWarning ? 'style="border-left-color: var(--accent-warning); background: rgba(245, 158, 11, 0.05);"' : 
                           isHigh ? 'style="border-left-color: var(--accent-danger); background: rgba(239, 68, 68, 0.05);"' : '';
          
          if (container && (isWarning || isHigh)) { // Only show high/warning in sidebar
            const html = `
              <div class="alert-item" ${styleStr}>
                <div class="alert-time">${alert.time}</div>
                <div>
                  <strong>${alert.title}</strong>
                  <div style="color: var(--text-secondary); font-size: 0.8rem;">${alert.description}</div>
                </div>
              </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
          }
          
          if (fullTable) {
            const tableLevelHtml = alert.level === 'high' ? '<span style="color: var(--accent-danger);">High</span>' : 
                                   alert.level === 'warning' ? '<span style="color: var(--accent-warning);">Warning</span>' : 
                                   '<span style="color: var(--text-muted);">Info</span>';
            const rowHtml = `
              <tr>
                <td>${alert.time}</td>
                <td>${tableLevelHtml}</td>
                <td>${alert.title}</td>
                <td>${alert.description}</td>
              </tr>
            `;
            fullTable.insertAdjacentHTML('beforeend', rowHtml);
          }
        });
      }
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    }
  }

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
  fetchAlerts();
  fetchStatus();
  setInterval(fetchAlerts, 10000); // refresh every 10s
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
});
