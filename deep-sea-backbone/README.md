# The Deep-Sea Backbone

**How AI turns undersea fiber into a self-healing nervous system.**

An interactive 2D/3D learning experience that explains how artificial intelligence works with subsea fiber-optic cables, the cables that carry over 95% of transcontinental internet traffic. It is built for curious learners with no engineering background.

## Quick start

1. Unzip the folder.
2. Open `index.html` in Chrome, Edge, Firefox or Safari (double-click it, or use Live Server in VS Code).
3. Click **Tap to Dive** to start the deep-sea soundscape.

No install, no server and no internet connection are needed. Keep `index.html` and `three.min.js` in the same folder.

## What's inside

### Simulator
A 3D seabed with seven cities and ten glowing cables carrying pulses of light.

- Drag to orbit, scroll or pinch to zoom
- Hover or tap a cable for its route, latency, signal quality and status
- Click a city for simulated live readings (polarization, signal-to-noise ratio, temperature, pressure)
- Traffic Load slider, route filters and a Show AI Edge stress heatmap
- Simulate Seismic Event: a five-step sequence of shockwave, cable failure, ship anchor and automatic rerouting
- Three color themes: Ocean, Aurora, Orchid

### Components
An explorer for the four parts of the system: fiber cable, coherent optical transponder, AI edge analytics and network controller.

- Layer slider, category filters and a Beginner / Technical toggle
- A Why It Matters tab with a real-world example for each part
- Side-by-side Compare table

### Learn
- Four lessons that unlock one after another, with swipeable slides on phones
- Reactive Era to AI Era timeline slider
- Key Terms glossary with filters
- Five-question quiz with explanations and a list of topics to review
- Replay Simulator button that jumps back to the matching part of the Simulator

## Controls and accessibility

- Sound starts only after **Tap to Dive**, with a mute button and volume slider
- **Reduce motion** replaces smooth camera movement with instant moves (also follows your device setting)
- Works on laptop and phone screens; tap targets are at least 44 px

## Customize

| To change | File | Look for |
| --- | --- | --- |
| Colors | `css/style.css` | `--cy` and `--vi` at the top |
| Color themes | `js/scene.js` | `THS` |
| Cities and cables | `js/scene.js` | `CT` (cities) and `CB` (cables) |
| Component text | `js/components.js` | the `K` array |
| Lesson text and timeline | `js/learn.js` | `LS` and `TL` |
| Quiz questions | `js/learn.js` | `QZ` |
| Glossary terms | `js/learn.js` | `GL` |

## Built with

- [Three.js](https://threejs.org/) r128 for the 3D scene (bundled as `three.min.js`)
- The Web Audio API for all sound effects, generated in the browser with no audio files
- Plain HTML, CSS and JavaScript

## Notes

- The map is schematic, not geographic, and cable latency and telemetry values are simulated for teaching.
- Browsers only allow sound after a click or tap, which is why the entry button exists.

## Files

```
deep-sea-backbone/
├── index.html         page structure (HTML only)
├── css/style.css      all styling
├── js/core.js         helpers, sound effects, page navigation
├── js/scene.js        3D seabed, cables, camera, Simulator controls
├── js/components.js   Components page
├── js/learn.js        Learn page: lessons, timeline, glossary, quiz
├── js/main.js         start-up
├── three.min.js       Three.js library (minified, not our code)
└── README.md          this file
```
