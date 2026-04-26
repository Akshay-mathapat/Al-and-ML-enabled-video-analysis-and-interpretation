# NSG Supervisor — AI/ML Video Analysis & Interpretation 🛡️

A state-of-the-art, premium web interface designed for the **National Security Guard (NSG)** to automate the analysis of surveillance feeds. This platform integrates Artificial Intelligence and Machine Learning to process complex visual data, detect anomalies in real-time, and empower tactical commanders with immediate, data-driven insights.

## 🌟 Key Features

* **Real-time Anomaly Detection**: Simulates neural networks scanning video feeds instantly to identify unauthorized personnel, suspicious packages, and unusual behavioral patterns without human intervention.
* **Multi-Cam Synchronization**: A unified tactical dashboard that seamlessly integrates streams from drones, bodycams, and stationary CCTV networks with low-latency oversight.
* **Predictive AI Insights**: Highlights high-risk zones, generates heatmaps, and triggers alerts based on historical data and pattern recognition to aid proactive troop deployment.
* **Premium Tactical UI**: A completely custom, dark-themed glassmorphism interface built for maximum readability and focus during high-stress scenarios.

## 🚀 Technologies Used

* **Frontend Structure**: HTML5
* **Styling**: Vanilla CSS3 (Custom Variables, CSS Grid/Flexbox, Glassmorphism, Micro-animations)
* **Logic & Interaction**: Vanilla JavaScript (ES6+)
* **Typography**: Google Fonts (`Inter` & `Outfit`)
* **Icons**: Remix Icons

## 📂 Project Structure

```text
├── index.html           # Landing page featuring capabilities and mission overview
├── login.html           # Secure Supervisor authentication portal
├── dashboard.html       # Core AI multi-cam workspace and alert center
├── css/
│   ├── variables.css    # Design tokens and color palettes
│   ├── global.css       # Core styling and animations
│   └── dashboard.css    # Layout specifics for the tactical grid
├── js/
│   ├── main.js          # Global interactions (smooth scroll, theme toggling)
│   └── dashboard.js     # Simulated ML logic and multi-video playback controls
└── assets/              # Mission-critical media files (images & mock ML videos)
```

## 🛠️ How to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akshay-mathapat/Al-and-ML-enabled-video-analysis-and-interpretation.git
   ```
2. **Open the project:**
   Navigate into the project directory and simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari). No build tools, Node.js, or local servers are strictly required for the frontend demonstration.

## 🤝 Next Steps for Backend Integration
To transition this from a frontend mockup to a fully functional AI product:
1. Connect the `dashboard.js` logic to a Python/Flask backend using WebSockets.
2. Pipe actual RTSP camera streams through OpenCV.
3. Feed the frames through your trained YOLOv8 / AI models to generate live bounding box coordinates.
4. Push those coordinates to the frontend to draw the `.bbox` overlay dynamically.

---
*Developed for AI-Integrated Command Operations.*
