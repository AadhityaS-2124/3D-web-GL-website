# Neural Nexus
### ✨ An Ultra-Premium Cinematic 3D WebGL Experience

<div align="center">

![WebGL](https://img.shields.io/badge/WebGL-3.0-090)
![Three.js](https://img.shields.io/badge/Three.js-v0.185.1-blue)
![GSAP](https://img.shields.io/badge/GSAP-v3.15.0-yellow)
![Vite](https://img.shields.io/badge/Vite-v8.1.1-purple)
![License](https://img.shields.io/badge/License-MIT-green)

**A cinematic digital experience showcasing luxury motion design, interactive 3D visualization, and premium WebGL architecture**

[🌐 Live Demo](#) • [📖 Documentation](#overview) • [🚀 Getting Started](#quick-start) • [💬 Contribute](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Performance](#performance)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Neural Nexus** is an exploration of physical refractive mediums, intricate rotational kinematics, and cutting-edge 3D visualization. This premium WebGL experience demonstrates advanced motion design principles through an interactive single-scene digital canvas.

### 🎬 Experience Highlights

The journey is divided into five seamless sections:

| Section | Name | Description |
|---------|------|-------------|
| **01** | 🌌 **PROLOGUE** | Kinetic Quantum Core - Your entry into the spatial experience |
| **02** | 🧠 **SYNAPSE** | Neural Lattice Structure - Self-assembling titanium nodes with dynamic wireframe connections |
| **03** | ⚙️ **KINETICS** | Kinetic Torus Sculpture - Polished dark-titanium sculptures with orbiting micro-satellites |
| **04** | 🔍 **CHRONOS** | Interactive Diagnostics - Select and inspect 3D objects with focused telemetry mode |
| **05** | 📡 **EPILOGUE** | Acquire Core Access - Connect with our creative technical labs |

---

## ✨ Features

### 🎨 Visual & Interactive Excellence
- **Premium WebGL Rendering** - High-fidelity 3D visualization with advanced shading
- **Physics-Based Rendering (PBR)** - Realistic material properties and light interactions
- **Dynamic Wireframe Connections** - Real-time proximity calculation and node linking
- **Smooth Camera Transitions** - Cinematic scroll-driven navigation with focus modes
- **Custom Cursor System** - Minimalist interactive cursor with visual feedback

### 🎭 Advanced Motion Design
- **GSAP-Powered Animations** - Professional tweening and timeline orchestration
- **Scroll-Triggered Effects** - Synchronized 3D object movement with page scroll
- **Parallax Layering** - Multi-depth visual composition
- **Micro-interactions** - Hover effects and dynamic element reactions

### 🎮 Interactive Features
- **Inspect Mode** - Click to focus and analyze individual 3D objects
- **Object Telemetry** - Real-time display of material properties and system states
- **Minimalist Preloader** - Smooth percentage-based asset loading visualization
- **Scroll Progress Indicator** - Visual guide through the experience
- **Section Navigation Dots** - Quick navigation between experience chapters

### ⚡ Performance Optimized
- **Real-Time FPS Display** - Monitor rendering performance
- **Render Quality Indicators** - HIGH-PBR quality badge
- **Optimized Asset Loading** - Efficient resource management
- **Responsive Design** - Seamless experience across devices

---

## 📁 Project Structure

```
3D-web-GL-website/
├── src/
│   ├── main.js              # Application entry point
│   ├── styles/              # CSS modules
│   │   ├── main.css         # Global styles
│   │   ├── animations.css   # Motion design
│   │   └── responsive.css   # Mobile optimization
│   └── scenes/              # Three.js scene configurations
│       ├── scene.js         # Main 3D scene setup
│       ├── objects.js       # 3D object definitions
│       └── materials.js     # PBR material definitions
├── public/                  # Static assets
│   ├── models/              # 3D model files
│   └── textures/            # Texture maps
├── index.html               # Main HTML entry point
├── package.json             # Project dependencies
├── vite.config.js           # Vite configuration
└── README.md               # This file
```

---

## 🛠️ Tech Stack

### Frontend Framework
- **[Three.js](https://threejs.org/)** v0.185.1 - Professional 3D graphics library
- **[GSAP](https://greensock.com/gsap/)** v3.15.0 - Advanced animation engine
- **[Vite](https://vitejs.dev/)** v8.1.1 - Next-generation build tool

### Languages & Markup
- **JavaScript** (67.7%) - Core application logic
- **CSS** (19.8%) - Styling and animations
- **HTML** (12.5%) - Semantic structure

### Build & Development
- **ES Modules** - Modern JavaScript module system
- **Vite Dev Server** - Fast refresh development environment
- **Production Build** - Optimized bundle generation

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 16.0.0
- **npm** ≥ 8.0.0

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AadhityaS-2124/3D-web-GL-website.git
cd 3D-web-GL-website

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📖 Usage

### Navigation

- **Scroll** - Navigate through experience chapters
- **Click Nav Dots** - Jump to specific sections
- **Hover** - Trigger interactive element states
- **Click Objects** - Engage inspect mode for detailed analysis

### Development Commands

```bash
# Start development server with hot module replacement
npm run dev

# Build for production with optimizations
npm run build

# Preview production-ready build
npm run preview
```

### Configuration

Edit `vite.config.js` to customize:
- Base path for GitHub Pages deployment
- Output directory for builds
- Custom build optimizations

---

## ⚡ Performance Metrics

The project is optimized for high performance:

- **Real-Time FPS Monitoring** - Visual performance indicator in footer
- **HIGH-PBR Rendering** - Premium material quality settings
- **Efficient Asset Loading** - Progressive resource loading with visual feedback
- **Optimized Bundle Size** - Minified and tree-shaken dependencies

### Recommended Browser Support
- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14

---

## 🎨 Customization

### Modifying Scenes
Edit `src/scenes/scene.js` to adjust:
- Object geometries and positions
- Material properties and colors
- Camera movement and positioning
- Lighting configuration

### Styling
Customize visual appearance in `src/styles/`:
- `main.css` - Global color scheme and layout
- `animations.css` - Motion timings and easing
- `responsive.css` - Breakpoint adjustments

### Animation Timings
Modify GSAP timeline in `src/main.js`:
- Scroll trigger thresholds
- Element duration and delays
- Easing functions and curves

### Content Updates
Edit `index.html` to change:
- Section text and descriptions
- Navigation links and labels
- Contact form fields
- UI element text

---

## 🐛 Troubleshooting

### WebGL Not Supported
- Ensure browser WebGL capabilities are enabled
- Try a different browser (Chrome recommended)
- Check GPU drivers are up-to-date

### Performance Issues
- Reduce object complexity in scene configuration
- Lower render quality in settings
- Check system resources and background processes

### Build Errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Areas
- 🎨 Enhance visual design and animations
- ⚡ Optimize performance and rendering
- 🐛 Report and fix bugs
- 📚 Improve documentation
- 🌍 Extend browser compatibility

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

```
MIT License - Free for personal and commercial use
```

---

## 👤 Author

**Aadhitya S** - [@AadhityaS-2124](https://github.com/AadhityaS-2124)

---

## 🔗 Resources & References

- [Three.js Documentation](https://threejs.org/docs/)
- [GSAP Animation Library](https://greensock.com/gsap/)
- [Vite Documentation](https://vitejs.dev/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Physics-Based Rendering](https://en.wikipedia.org/wiki/Physically_based_rendering)

---

<div align="center">

### ⭐ If you found this useful, please consider giving it a star!

Built with ❤️ by [Aadhitya S](https://github.com/AadhityaS-2124)

</div>
