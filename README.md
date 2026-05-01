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

OUTPUT 
<img width="1881" height="811" alt="Screenshot 2026-04-26 221836" src="https://github.com/user-attachments/assets/145b4ce5-ef0b-4a31-bd6f-5ef9cf203dff" />
<img width="834" height="768" alt="Screenshot 2026-04-26 215131" src="https://github.com/user-attachments/assets/deff9b2b-055b-4cdf-8067-09b97f8582d6" />
<img width="1910" height="843" alt="Screenshot 2026-04-26 222017" src="https://github.com/user-attachments/assets/050deb49-76ca-455b-9379-6c263b9ec312" />
<img width="1919" height="841" alt="Screenshot 2026-04-26 222054" src="https://github.com/user-attachments/assets/0e29f7bf-546d-4f16-831d-df1be370361c" />
<img width="1894" height="838" alt="Screenshot 2026-04-26 222142" src="https://github.com/user-attachments/assets/ce0d8b4d-8d41-45f0-a39a-fdf772ba680a" />

