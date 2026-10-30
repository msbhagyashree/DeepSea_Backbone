// components.js: the Components page (cards, layer slider, filters, compare table).
// ---- components
const K = [
    {
      n: "Subsea Fiber Cable",
      c: "Sensing",
      i: "🧵",
      w: "A hair-thin glass strand, wrapped in steel and plastic, that carries pulses of light across the ocean floor.",
      an: 'Like a very long microphone: the whole cable can "hear" vibrations along its length (Distributed Acoustic Sensing).',
      te: "Backscattered light changes with strain, so every few meters of fiber act as a sensor (DAS).",
      x: "Anchors, earthquakes, fishing gear and shark bites can bend or snap the glass.",
      ai: 'AI learns the cable\'s normal "hum" and flags unusual vibrations early.',
      y: "In 2006 an earthquake near Taiwan cut several cables and slowed internet across Asia for weeks.",
    },
    {
      n: "Coherent Optical Transponder",
      c: "Communication",
      i: "📡",
      w: "A device at each end that turns data into light and light back into data, measuring the light's phase and polarization.",
      an: 'Like a translator who speaks both "internet" and "light".',
      te: "Coherent receivers measure phase and State of Polarization (SOP), giving SNR and SOP readings many times a second.",
      x: "Heat, aging parts or weak light make the signal noisy and cause errors.",
      ai: "AI watches the signal-to-noise ratio (SNR) and spots slow decay before errors appear.",
      y: "A slowly falling SNR can warn operators of a failing repeater before customers notice.",
    },
    {
      n: "AI Edge Analytics",
      c: "Intelligence",
      i: "🧠",
      w: "Machine learning software near the cable landing station that reads the light signals all day.",
      an: "Like a doctor watching a heartbeat monitor who notices an odd beat before the patient feels ill.",
      te: "Models run anomaly detection on DAS and SOP time series and cross-check ship-tracking logs to localize stress within meters.",
      x: "Poor training data can cause false alarms or missed events.",
      ai: 'This is the AI itself: it turns raw wiggles of light into alerts such as "anchor dragging at 4,012 m".',
      y: "A ship dragging its anchor can be spotted before the cable is touched, so the captain can be warned.",
    },
    {
      n: "Network Controller",
      c: "Control",
      i: "🔀",
      w: "Software that decides which route traffic takes and flips optical switches.",
      an: "Like a GPS that instantly reroutes every car when a road closes.",
      te: "An orchestrator simulates failure scenarios, computes backup paths and reconfigures optical switches in under a millisecond.",
      x: "Backup routes can be longer or busier, so delay (latency) rises.",
      ai: 'AI pre-computes thousands of "what if this cable breaks" plans and picks the best one for current congestion.',
      y: "When Tokyo to Los Angeles goes dark, traffic can flow via Singapore, Mumbai and London instead.",
    },
  ],
  LY = [
    "Physical cable",
    "Light signal reader",
    "AI analysis",
    "Software control",
  ],
  CATS = ["All", "Sensing", "Communication", "Intelligence", "Control"];
let cur = -1,
  tab = 0,
  lvl = 0,
  cf = "All";
function rc() {
  $("#cg").innerHTML = K.map(
    (k, i) =>
      `<button class="tl${i == cur ? " hl" : ""}${cf != "All" && k.c != cf ? " hid" : ""}" data-i=${i}><small>${k.c}</small><b>${k.i} ${k.n}</b><br><span style="color:var(--mu);font-size:13px">${k.w}</span></button>`,
  ).join("");
  $$(".tl[data-i]").forEach(
    (b) =>
      (b.onclick = () => {
        if (b.closest("#cg")) sel(+b.dataset.i);
      }),
  );
}
function sel(i) {
  cur = i;
  tab = 0;
  $("#lay").value = i + 1;
  $("#ly").textContent = `${i + 1}/4 ${LY[i]}`;
  rc();
  card();
  bloop();
}
function card() {
  const d = $("#cd");
  if (cur < 0) {
    d.style.display = "none";
    return;
  }
  const k = K[cur];
  d.style.display = "block";
  d.innerHTML =
    `<button id=cx style="float:right">✕ Close</button><h3>${k.i} ${k.n}</h3><small>${k.c}</small><div class=chs><button class="${tab ? "" : "on"}" data-t=0>Overview</button><button class="${tab ? "on" : ""}" data-t=1>Why It Matters</button></div>` +
    (tab
      ? `<p><b>Real-world example:</b> ${k.y}</p>`
      : `<p><b>What it is:</b> ${k.w}</p><p><b>${lvl ? "How it works (technical)" : "Think of it like this"}:</b> ${lvl ? k.te : k.an}</p><p><b>What can go wrong:</b> ${k.x}</p><p><b>How AI helps:</b> ${k.ai}</p>`);
  $("#cx").onclick = () => {
    cur = -1;
    rc();
    card();
  };
  $$("#cd [data-t]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = +b.dataset.t;
        card();
      }),
  );
}
$("#cf").innerHTML = CATS.map(
  (c) => `<button class="${c == "All" ? "on" : ""}">${c}</button>`,
).join("");
$$("#cf button").forEach(
  (b) =>
    (b.onclick = () => {
      cf = b.textContent;
      $$("#cf button").forEach((x) => x.classList.toggle("on", x == b));
      if (cur >= 0 && cf != "All" && K[cur].c != cf) cur = -1;
      rc();
      card();
    }),
);
$("#lay").oninput = (e) => sel(e.target.value - 1);
$("#lvl").onclick = () => {
  lvl = !lvl;
  $("#lvl").textContent = "Detail: " + (lvl ? "Technical" : "Beginner");
  card();
};
function cmpR(a, b) {
  const o = (i) =>
      K.map(
        (k, j) =>
          `<option value=${j}${j == i ? " selected" : ""}>${k.n}</option>`,
      ).join(""),
    A = K[a],
    B = K[b],
    r = (l, f) => `<tr><th>${l}</th><td>${A[f]}</td><td>${B[f]}</td></tr>`;
  $("#cm").innerHTML =
    `<table><tr><th></th><th><select id=sa>${o(a)}</select></th><th><select id=sb>${o(b)}</select></th></tr>${r("Role", "c")}${r("What it is", "w")}${r("Can go wrong", "x")}${r("How AI helps", "ai")}</table>`;
  $("#sa").onchange = $("#sb").onchange = () =>
    cmpR(+$("#sa").value, +$("#sb").value);
}
$("#cpb").onclick = () => {
  const m = $("#cm");
  if (m.style.display == "block") {
    m.style.display = "none";
    return;
  }
  m.style.display = "block";
  const a = cur < 0 ? 0 : cur;
  cmpR(a, (a + 1) % 4);
};
