// core.js: helper functions, sound effects (Web Audio) and page navigation. Loaded first.
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  cl = (v, a, b) => Math.min(b, Math.max(a, v));
let RM = matchMedia("(prefers-reduced-motion:reduce)").matches,
  AC,
  MG,
  NB,
  mute = 0,
  vol = 0.6,
  load = 0.5,
  pgc = "sim";
$("#rm").checked = RM;
$("#rm").onchange = (e) => (RM = e.target.checked);
const gv = () => {
  if (MG) MG.gain.value = mute ? 0 : vol;
};
$("#snd").onclick = () => {
  mute = !mute;
  $("#snd").textContent = mute ? "🔇" : "🔊";
  gv();
};
$("#vol").oninput = (e) => {
  vol = e.target.value / 100;
  gv();
};
function tn(f, d, v = 0.1, t0 = 0, f2) {
  if (!AC) return;
  const t = AC.currentTime + t0,
    o = AC.createOscillator(),
    g = AC.createGain();
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g).connect(MG);
  o.start(t);
  o.stop(t + d);
}
const bloop = () => tn(300, 0.12, 0.08, 0, 700),
  ping = () => tn(900, 1.8, 0.15),
  chime = () => [523, 659, 784].forEach((f, i) => tn(f, 0.6, 0.1, i * 0.15)),
  whale = () => tn(180, 4, 0.05, 0, 260);
function rumble() {
  if (!AC) return;
  const t = AC.currentTime,
    n = AC.createBufferSource();
  n.buffer = NB;
  const f = AC.createBiquadFilter();
  f.frequency.value = 90;
  const g = AC.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.8, t + 2);
  g.gain.linearRampToValueAtTime(0, t + 2.1);
  n.connect(f).connect(g).connect(MG);
  n.start(t);
  n.stop(t + 2.3);
}
function aInit() {
  AC = new (window.AudioContext || window.webkitAudioContext)();
  AC.resume();
  MG = AC.createGain();
  gv();
  MG.connect(AC.destination);
  NB = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = NB.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  [55, 82.4].forEach((f, i) => {
    const o = AC.createOscillator(),
      g = AC.createGain();
    o.frequency.value = f;
    g.gain.value = 0.12 / (i + 1);
    o.connect(g).connect(MG);
    o.start();
  });
  const n = AC.createBufferSource();
  n.buffer = NB;
  n.loop = true;
  const lf = AC.createBiquadFilter();
  lf.frequency.value = 220;
  const ng = AC.createGain();
  ng.gain.value = 0.25;
  n.connect(lf).connect(ng).connect(MG);
  n.start();
  setInterval(whale, 9000);
  setTimeout(whale, 2500);
  setInterval(() => {
    for (let k = 0; k < Math.round(load * 4); k++)
      tn(2200 + Math.random() * 800, 0.05, 0.025, Math.random() * 0.35);
  }, 400);
}
$("#dive").onclick = () => {
  $("#ent").style.display = "none";
  aInit();
};
const HP = {
  sim: "Simulator: drag to orbit, scroll or pinch to zoom, tap a city, move the Traffic Load slider, filter routes, switch on AI Edge, or run the seismic event.",
  cmp: "Components: tap a part, drag the Layer slider, filter by role, switch detail level, open Why It Matters, or Compare two parts.",
  lrn: "Learn: finish lessons in order to unlock the next, explore the timeline and key terms, then take the quiz.",
};
function go(p) {
  pgc = p;
  $$(".pg").forEach((e) => e.classList.toggle("on", e.id == p));
  $$(".tab").forEach((b) => b.classList.toggle("on", b.dataset.p == p));
  if (p == "sim") rs();
}
$$(".tab").forEach(
  (b) =>
    (b.onclick = () => {
      go(b.dataset.p);
      bloop();
    }),
);
$("#hlp").onclick = () => {
  const h = $("#hp");
  h.innerHTML = HP[pgc] + "<br><button>Got it</button>";
  h.style.display = "block";
  $("#hp button").onclick = () => (h.style.display = "none");
};
