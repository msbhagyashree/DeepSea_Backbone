// scene.js: the Simulator page. 3D seabed, cities, cables, light pulses, camera, pointer controls, seismic event and telemetry graphs.
// ---- 3D scene
const cv = $("#cv"),
  R = new THREE.WebGLRenderer({ canvas: cv, antialias: true }),
  S = new THREE.Scene(),
  C = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
R.setPixelRatio(Math.min(devicePixelRatio, 2));
S.background = new THREE.Color(0x030814);
S.fog = new THREE.FogExp2(0x041022, 0.016);
S.add(new THREE.AmbientLight(0x2a4a7a, 1));
const PL = new THREE.PointLight(0x35e0ff, 1.2, 90);
PL.position.set(0, 20, 5);
S.add(PL);
const pg = new THREE.PlaneGeometry(64, 36, 64, 36).rotateX(-Math.PI / 2),
  pp = pg.attributes.position;
for (let i = 0; i < pp.count; i++) {
  const x = pp.getX(i),
    z = pp.getZ(i);
  pp.setY(
    i,
    Math.sin(x * 0.4) * 0.5 +
      Math.cos(z * 0.5 + x * 0.2) * 0.5 +
      Math.sin(x * 1.3 + z) * 0.15,
  );
}
pg.computeVertexNormals();
S.add(
  new THREE.Mesh(
    pg,
    new THREE.MeshStandardMaterial({
      color: 0x0f2440,
      roughness: 1,
      flatShading: true,
    }),
  ),
);
const CT = {
    Tokyo: [22, -2],
    "Los Angeles": [-22, 3],
    London: [-4, -6],
    Mumbai: [10, 3],
    Singapore: [17, 9],
    Sydney: [27, 12],
    "Rio de Janeiro": [-12, 13],
  },
  nd = [],
  lbs = $("#lbs");
for (const k in CT) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x35e0ff }),
  );
  m.position.set(CT[k][0], 1.5, CT[k][1]);
  m.userData.n = k;
  S.add(m);
  const h = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x35e0ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  h.position.copy(m.position);
  S.add(h);
  const d = document.createElement("div");
  d.className = "lb";
  d.textContent = k;
  lbs.appendChild(d);
  nd.push({ m, d, h });
}
const CB = [
    ["Tokyo", "Los Angeles", "p", 98, 0, -14],
    ["Los Angeles", "London", "a", 72, 0, 7],
    ["London", "Mumbai", "e", 58, 0, -4],
    ["Mumbai", "Singapore", "e", 24, 3, 2],
    ["Singapore", "Tokyo", "p", 46, 2, 2],
    ["Los Angeles", "Singapore", "p", 110, 0, 10],
    ["Singapore", "Sydney", "p", 38, 2, 1],
    ["Sydney", "Los Angeles", "p", 124, 0, 3],
    ["London", "Rio de Janeiro", "a", 92, -3, 0],
    ["Los Angeles", "Rio de Janeiro", "a", 64, 0, 3],
  ],
  PG = new THREE.SphereGeometry(0.34, 8, 8),
  V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const cabs = CB.map(([a, b, g, lat, ox, oz]) => {
  const A = CT[a],
    B = CT[b],
    cu = new THREE.CatmullRomCurve3([
      V3(A[0], 1.5, A[1]),
      V3((A[0] + B[0]) / 2 + ox, 1.3, (A[1] + B[1]) / 2 + oz),
      V3(B[0], 1.5, B[1]),
    ]),
    m = new THREE.Mesh(
      new THREE.TubeGeometry(cu, 64, 0.22, 6),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true }),
    );
  S.add(m);
  const pl = [];
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(
      PG,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x35e0ff).lerp(
          new THREE.Color(0x9b6bff),
          i / 12,
        ),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    p.t = Math.random();
    S.add(p);
    pl.push(p);
  }
  return {
    a,
    b,
    g,
    lat,
    cu,
    m,
    pl,
    st: 0,
    rr: 0,
    dt: 0,
    snr: (21 + Math.random() * 3).toFixed(1),
  };
});
const AP = cabs[0].cu.getPoint(0.5),
  ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1, 64).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xff4d5e,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    }),
  );
ring.position.set(AP.x, 1.25, AP.z);
S.add(ring);
const hc = document.createElement("canvas");
hc.width = hc.height = 128;
const hx = hc.getContext("2d"),
  gr = hx.createRadialGradient(64, 64, 0, 64, 64, 64);
gr.addColorStop(0, "rgba(255,77,94,.95)");
gr.addColorStop(0.5, "rgba(255,176,46,.5)");
gr.addColorStop(1, "rgba(255,176,46,0)");
hx.fillStyle = gr;
hx.fillRect(0, 0, 128, 128);
const heat = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(hc),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
heat.position.set(AP.x, 1.2, AP.z);
S.add(heat);
const ship = new THREE.Group(),
  hm = new THREE.MeshStandardMaterial({ color: 0x2a4a70, emissive: 0x14325a }),
  hull = new THREE.Mesh(new THREE.BoxGeometry(7, 1, 2.2), hm),
  cn = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.8), hm);
cn.position.set(-1.5, 1.2, 0);
ship.add(
  hull,
  cn,
  new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(0, -12, 0)]),
    new THREE.LineBasicMaterial({ color: 0xffb02e }),
  ),
);
ship.position.set(-18, 13.2, AP.z);
ship.visible = false;
S.add(ship);
const pa = new Float32Array(1500);
for (let i = 0; i < 1500; i += 3) {
  pa[i] = (Math.random() - 0.5) * 64;
  pa[i + 1] = Math.random() * 20 + 1;
  pa[i + 2] = (Math.random() - 0.5) * 36;
}
const pk = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.BufferAttribute(pa, 3),
  ),
  new THREE.PointsMaterial({
    color: 0x9fe8ff,
    size: 0.12,
    transparent: true,
    opacity: 0.6,
  }),
);
S.add(pk);
const rays = [];
for (let i = 0; i < 7; i++) {
  const r = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6 + Math.random() * 2, 28),
    new THREE.MeshBasicMaterial({
      color: 0x6fdcff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  r.position.set(-26 + i * 8.5, 12, (Math.random() - 0.5) * 24);
  r.rotation.z = 0.25;
  r.rotation.y = Math.random() * 3;
  S.add(r);
  rays.push(r);
}
let TH = [0x35e0ff, 0x9b6bff];
const THS = [
    [0x35e0ff, 0x9b6bff],
    [0x4dffb0, 0x35a8ff],
    [0xff6fd8, 0x7a8bff],
  ],
  hex = (n) => "#" + n.toString(16).padStart(6, "0");
function setTheme(i) {
  TH = THS[i];
  const ds = document.documentElement.style;
  ds.setProperty("--cy", hex(TH[0]));
  ds.setProperty("--vi", hex(TH[1]));
  nd.forEach((n) => {
    n.m.material.color.setHex(TH[0]);
    n.h.material.color.setHex(TH[0]);
  });
  cabs.forEach((c) =>
    c.pl.forEach((p, j) =>
      p.material.color.setHex(TH[0]).lerp(new THREE.Color(TH[1]), j / 12),
    ),
  );
  $$("#th button").forEach((x, k) => x.classList.toggle("on", k == i));
  say(
    "Color theme: " +
      ["Ocean", "Aurora", "Orchid"][i] +
      ". Red and amber stay reserved for alerts.",
  );
  bloop();
}
$$("#th button").forEach((b, i) => (b.onclick = () => setTheme(i)));
const al = document.createElement("div");
al.className = "lb";
lbs.appendChild(al);
const cm = { th: 0.2, ph: 1, r: innerWidth < 800 ? 66 : 42, tg: V3(0, 0, 0) },
  gt = { th: 0.2, ph: 1, r: cm.r, tg: V3(0, 0, 0) },
  home = () => {
    gt.tg.set(0, 0, 0);
    gt.r = innerWidth < 800 ? 66 : 42;
  };
function rs() {
  const w = $("#sim").clientWidth,
    h = $("#sim").clientHeight;
  if (!w || !h) return;
  R.setSize(w, h, false);
  C.aspect = w / h;
  C.updateProjectionMatrix();
}
new ResizeObserver(rs).observe($("#sim"));
const say = (t) => ($("#cap").textContent = t);
say(
  "You are 4,000 m under the ocean. Glowing lines are fiber-optic cables. Moving dots are pulses of light carrying data. Tap a city or hover a cable to explore.",
);
// pointer
const P = new Map(),
  RC = new THREE.Raycaster(),
  V = new THREE.Vector2(),
  tip = $("#tip"),
  ST = ["Healthy", "Stressed", "Down"];
let mv = 0,
  pd = 1,
  hv = -1,
  lh = -1,
  fc = "";
const pdist = () => {
  const v = [...P.values()];
  return v.length > 1 ? Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]) : 1;
};
function ray(e) {
  const r = cv.getBoundingClientRect();
  V.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    (-(e.clientY - r.top) / r.height) * 2 + 1,
  );
  RC.setFromCamera(V, C);
}
const hit = (e) => {
  ray(e);
  const i = RC.intersectObjects(cabs.map((c) => c.m))[0];
  return i ? cabs.findIndex((c) => c.m == i.object) : -1;
};
function showTip(i, e) {
  if (i < 0) {
    tip.style.display = "none";
    return;
  }
  const c = cabs[i];
  tip.innerHTML = `Route: ${c.a} to ${c.b} | Latency: ${c.lat + (c.rr ? 12 : 0)} ms | SNR: ${c.snr} dB | Status: ${ST[c.st]}`;
  tip.style.display = "block";
  tip.style.left = Math.min(e.clientX + 12, innerWidth - 270) + "px";
  tip.style.top = e.clientY + 12 + "px";
}
function focus(n) {
  fc = n;
  bloop();
  const p = CT[n];
  gt.tg.set(p[0], 1, p[1]);
  gt.r = 20;
  $("#tn").textContent = n + " landing station";
  $("#tel").style.display = "block";
  say(
    `You selected ${n}, where the cable comes ashore. The graphs show simulated live readings from the light inside the fiber.`,
  );
}
function pick(e) {
  ray(e);
  const n = RC.intersectObjects(nd.map((x) => x.m))[0];
  if (n) {
    focus(n.object.userData.n);
    return;
  }
  const i = hit(e);
  hv = i;
  showTip(i, e);
  if (i >= 0) {
    bloop();
    setTimeout(() => showTip(-1), 3500);
  }
}
cv.onpointerdown = (e) => {
  cv.setPointerCapture(e.pointerId);
  P.set(e.pointerId, [e.clientX, e.clientY]);
  mv = 0;
  pd = pdist();
};
cv.onpointermove = (e) => {
  const o = P.get(e.pointerId);
  if (o) {
    const dx = e.clientX - o[0],
      dy = e.clientY - o[1];
    P.set(e.pointerId, [e.clientX, e.clientY]);
    mv += Math.abs(dx) + Math.abs(dy);
    if (P.size == 1) {
      gt.th -= dx * 0.006;
      gt.ph = cl(gt.ph - dy * 0.006, 0.25, 1.45);
    } else {
      const d = pdist();
      gt.r = cl((gt.r * pd) / d, 12, 80);
      pd = d;
    }
  } else {
    hv = hit(e);
    showTip(hv, e);
    cv.style.cursor = hv >= 0 ? "pointer" : "grab";
    if (hv >= 0 && hv != lh) bloop();
    lh = hv;
  }
};
cv.onpointerup = cv.onpointercancel = (e) => {
  if (P.has(e.pointerId) && P.size == 1 && mv < 6) pick(e);
  P.delete(e.pointerId);
};
cv.onwheel = (e) => {
  e.preventDefault();
  gt.r = cl(gt.r * (1 + e.deltaY * 0.001), 12, 80);
};
// controls
let fg = "",
  ae = 0,
  busy = 0,
  qd = 0,
  rt = 0,
  tm = [];
const FC = {
  "": "Viewing all ten cable routes.",
  p: "Trans-Pacific routes link Asia and North America.",
  a: "Trans-Atlantic routes link North America and Europe.",
  e: "Asia-Europe routes link Europe to India and Southeast Asia.",
};
$$("#fl button").forEach(
  (b) =>
    (b.onclick = () => {
      fg = b.dataset.g;
      $$("#fl button").forEach((x) => x.classList.toggle("on", x == b));
      say(FC[fg] + (fg ? " Other routes are dimmed." : ""));
      bloop();
    }),
);
$("#ld").oninput = (e) => {
  load = e.target.value / 100;
  $("#lt").textContent = e.target.value + "%";
  say(
    `Traffic load is ${e.target.value}%. More data means more light pulses, moving faster.`,
  );
};
$("#ai").onclick = (e) => {
  ae = !ae;
  e.target.classList.toggle("on", ae);
  e.target.textContent = ae ? "Hide AI Edge" : "Show AI Edge";
  say(
    ae
      ? "AI Edge is on. The heatmap shows where the cable is under mechanical stress, found by reading tiny changes in the light."
      : "AI Edge is off.",
  );
  bloop();
};
$("#tx").onclick = () => {
  $("#tel").style.display = "none";
  fc = "";
  home();
};
const SQ = [
  "A seismic shockwave is detected on the seabed.",
  "The cable turns amber as mechanical stress rises.",
  "The cable fails at this point and goes dark.",
  "A ship's anchor line is detected overhead.",
  "Traffic is rerouted through Atlantic and Pacific paths in 0.8 ms.",
];
function reset() {
  tm.forEach(clearTimeout);
  tm = [];
  busy = qd = rt = 0;
  cabs.forEach((c) => (c.st = c.rr = 0));
  ship.visible = false;
  ring.material.opacity = 0;
  $("#hud").style.display = "none";
  $("#qk").textContent = "Simulate Seismic Event";
  home();
  say("Network reset. All cables are healthy.");
}
function quake() {
  if (qd) {
    reset();
    return;
  }
  if (busy) return;
  busy = 1;
  const at = (ms, f) => tm.push(setTimeout(f, ms));
  gt.tg.set(AP.x, 1, AP.z);
  gt.r = 30;
  say("Step 1: " + SQ[0]);
  rt = performance.now();
  ping();
  at(1500, rumble);
  at(2500, () => {
    say("Step 2: " + SQ[1]);
    cabs[0].st = 1;
  });
  at(5000, () => {
    say("Step 3: " + SQ[2]);
    cabs[0].st = 2;
    cabs[0].dt = performance.now();
  });
  at(7500, () => {
    say("Step 4: " + SQ[3]);
    ship.visible = true;
    ship.position.x = -18;
  });
  at(10000, () => {
    say("Step 5: " + SQ[4]);
    [1, 2, 3, 4, 5].forEach((i) => (cabs[i].rr = 1));
    $("#hud").style.display = "block";
    chime();
    home();
    busy = 0;
    qd = 1;
    $("#qk").textContent = "Reset Network";
  });
}
$("#qk").onclick = quake;
const M = [
    ["SOP (rad)", 0.8, 0.15, "#35e0ff"],
    ["SNR (dB)", 22.4, 0.8, "#9b6bff"],
    ["Temp (°C)", 2.1, 0.1, "#7fffd4"],
    ["Pressure (atm)", 400, 2, "#ffb02e"],
  ],
  H = M.map(() => []);
setInterval(() => {
  M.forEach((m, i) => {
    const s = cabs[0].st && fc ? 1 : 0;
    H[i].push(
      m[1] +
        (Math.random() - 0.5) * m[2] * 2 +
        (i < 2 ? s * m[2] * (i ? -4 : 4) : 0),
    );
    if (H[i].length > 60) H[i].shift();
  });
  if ($("#tel").style.display == "block") dg();
}, 250);
function dg() {
  const g = $("#gr").getContext("2d");
  g.clearRect(0, 0, 270, 150);
  M.forEach((m, i) => {
    const y0 = i * 37.5,
      a = H[i];
    g.fillStyle = "#8aa6bd";
    g.font = "10px monospace";
    g.fillText(m[0] + ": " + (a[a.length - 1] || 0).toFixed(2), 2, y0 + 10);
    g.strokeStyle = m[3];
    g.beginPath();
    a.forEach((v, k) => {
      const y = y0 + 34 - cl((v - (m[1] - m[2] * 4)) / (m[2] * 8), 0, 1) * 22;
      k ? g.lineTo(k * 4.5, y) : g.moveTo(0, y);
    });
    g.stroke();
  });
}
const pj = (v, el) => {
  v.project(C);
  el.style.display = v.z < 1 ? "block" : "none";
  el.style.left = (v.x * 0.5 + 0.5) * cv.clientWidth + "px";
  el.style.top = (-v.y * 0.5 + 0.5) * cv.clientHeight + "px";
};
let T0 = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - T0) / 1000);
  T0 = now;
  if (pgc != "sim") return;
  const k = RM ? 1 : 0.07;
  cm.th += (gt.th - cm.th) * k;
  cm.ph += (gt.ph - cm.ph) * k;
  cm.r += (gt.r - cm.r) * k;
  cm.tg.lerp(gt.tg, k);
  C.position.set(
    cm.tg.x + cm.r * Math.sin(cm.ph) * Math.sin(cm.th),
    cm.tg.y + cm.r * Math.cos(cm.ph),
    cm.tg.z + cm.r * Math.sin(cm.ph) * Math.cos(cm.th),
  );
  C.lookAt(cm.tg);
  cabs.forEach((c, i) => {
    const dim = fg && c.g != fg,
      col = new THREE.Color(c.st == 1 ? 0xffb02e : TH[0]);
    let alive = 1;
    if (c.st == 2) {
      const e = (now - c.dt) / 1000;
      col.setHex(e < 1.5 && Math.random() < 0.5 ? 0xff4d5e : 0x2a0a12);
      alive = 0;
    }
    if (c.rr) col.lerp(new THREE.Color(TH[1]), 0.5);
    if (i == hv) col.lerp(new THREE.Color(0xffffff), 0.5);
    c.m.material.color.copy(col);
    c.m.material.opacity = dim ? 0.12 : 0.9;
    const n = alive && !dim ? Math.max(c.rr ? 9 : 0, Math.round(load * 12)) : 0,
      sp = (0.03 + load * 0.12) * (c.st == 1 ? 0.4 : 1) * (c.rr ? 1.3 : 1);
    c.pl.forEach((p, j) => {
      p.visible = j < n;
      if (p.visible) {
        p.t = (p.t + dt * sp) % 1;
        p.position.copy(c.cu.getPoint(p.t));
      }
    });
  });
  nd.forEach(({ m, d }) => pj(m.position.clone(), d));
  const hot = cabs[0].st ? 1 : 0;
  heat.material.opacity +=
    ((ae ? (hot ? 0.9 : 0.35) : 0) - heat.material.opacity) * 0.1;
  pj(V3(AP.x, 3, AP.z), al);
  if (!ae) al.style.display = "none";
  al.style.color = hot ? "#ff4d5e" : hex(TH[0]);
  al.textContent = hot
    ? "Anomaly detected at 4,012 m, ±3 m"
    : "Stress zone: low, monitoring";
  if (rt) {
    const e = (now - rt) / 1000;
    if (e < 3) {
      ring.scale.setScalar(1 + e * 7);
      ring.material.opacity = 0.9 * (1 - e / 3);
    } else {
      ring.material.opacity = 0;
      rt = 0;
    }
  }
  if (ship.visible) ship.position.x = Math.min(0, ship.position.x + dt * 3.5);
  rays.forEach(
    (r, i) =>
      (r.material.opacity = 0.045 + 0.035 * Math.sin(now / 1500 + i * 1.7)),
  );
  pk.rotation.y += dt * 0.01;
  pk.position.y = Math.sin(now / 3000) * 0.4;
  R.render(S, C);
}
