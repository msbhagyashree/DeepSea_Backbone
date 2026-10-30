// learn.js: the Learn page (lessons, timeline, glossary, quiz) and the Replay Simulator link.
// ---- learn
const LS = [
  [
    "Why the Ocean Carries the Internet",
    [
      "Over 95% of data crossing between continents travels through cables on the seabed, not satellites. Glass fiber carries far more data, faster and cheaper.",
      "The light pulses inside the glass are the data. A strand thinner than a hair can carry huge amounts, because light can be switched on and off billions of times a second.",
      "The catch: cables lie 4,000 m down, under huge pressure, near earthquakes and ship anchors. Before AI, nobody knew about damage until the internet went dark.",
    ],
  ],
  [
    "The Fiber Is the Sensor",
    [
      "A fiber can also be a sensor. Distributed Acoustic Sensing (DAS) sends light pulses down the fiber and listens to the tiny echo that bounces back.",
      "Why it works: the cable is so long that even a small vibration changes the light's timing. A passing anchor changes the echo, like a footstep shaking a long rope.",
      "Coherent optics measure the light's phase (its timing) and polarization (its wobble direction). AI reads both, so one cable acts like thousands of microphones.",
    ],
  ],
  [
    "Predicting Failures and Finding Faults",
    [
      'AI learns what a healthy cable "sounds" like. When the pattern drifts, for example a falling signal-to-noise ratio (SNR), it raises an alert.',
      "It compares the clues with ship-tracking logs. A ship stopped above a stressed cable is probably dragging an anchor.",
      "Echo timing also shows where the stress is, within a few meters. Repair ships go to the right spot instead of searching for days.",
    ],
  ],
  [
    "Autonomous Rerouting",
    [
      'If a cable fails, traffic must move instantly. A network controller keeps plans ready for thousands of "what if" failures.',
      "The best backup depends on current congestion, so AI picks the path with the least delay, such as Tokyo to Singapore, Mumbai, London, then Los Angeles.",
      "Optical switches then flip the light onto the new route in under a millisecond, so most people never notice the break.",
    ],
  ],
];
let dn = 0,
  li = 0,
  si = 0,
  x0 = 0;
function rl() {
  $("#lg").innerHTML = LS.map(
    (l, i) =>
      `<button class=tl data-l=${i} ${i > dn ? "disabled" : ""}><small>Lesson ${i + 1} ${i < dn ? "✓" : i > dn ? "🔒" : ""}</small><b>${l[0]}</b></button>`,
  ).join("");
  $$("[data-l]").forEach(
    (b) =>
      (b.onclick = () => {
        li = +b.dataset.l;
        si = 0;
        lw();
      }),
  );
  $("#pb i").style.setProperty("--p", (dn / 4) * 100 + "%");
}
function lw() {
  const w = $("#lw"),
    l = LS[li],
    last = si == 2;
  w.style.display = "block";
  w.innerHTML = `<small>Lesson ${li + 1}: ${l[0]}</small><p style="font-size:18px;min-height:110px">${l[1][si]}</p><div>${[0, 1, 2].map((i) => `<span style="color:${i == si ? "#35e0ff" : "#35566f"}">●</span>`).join(" ")}</div><div class=chs><button id=lbk ${si ? "" : "disabled"}>Back</button><button id=lnx>${last ? "Finish lesson" : "Next"}</button>${last && dn > li ? "<button id=lrp>Replay Simulator</button>" : ""}</div>`;
  $("#lbk").onclick = bk;
  $("#lnx").onclick = nx;
  if ($("#lrp")) $("#lrp").onclick = () => replay(li);
}
function nx() {
  if (si < 2) si++;
  else dn = Math.max(dn, li + 1);
  rl();
  lw();
  bloop();
  if (si == 2 && dn > li) chime();
}
function bk() {
  if (si > 0) {
    si--;
    lw();
  }
}
$("#lw").ontouchstart = (e) => (x0 = e.touches[0].clientX);
$("#lw").ontouchend = (e) => {
  const d = e.changedTouches[0].clientX - x0;
  if (Math.abs(d) > 50) d < 0 ? nx() : bk();
};
const TL = [
  "<b>Reactive Era.</b> A cable breaks, the internet slows, and nobody knows exactly where. A repair ship sails out, hooks the cable from the seabed and splices it by hand. Repairs can take days or weeks.",
  "<b>AI Era.</b> The fiber senses danger, AI predicts failures and pinpoints faults within meters, and traffic reroutes itself in under a millisecond.",
];
$("#tls").oninput = (e) =>
  ($("#tlt").innerHTML = TL[e.target.value >= 50 ? 1 : 0]);
$("#tlt").innerHTML = TL[0];
const GL = [
  [
    "DAS",
    "Distributed Acoustic Sensing: using the whole fiber as a microphone by reading light echoes.",
  ],
  [
    "SOP",
    "State of Polarization: the direction the light's wave wobbles. Vibration or bending twists it.",
  ],
  [
    "SNR",
    "Signal-to-Noise Ratio: how clear the signal is compared with background hiss. Falling SNR means trouble.",
  ],
  [
    "Optical switching",
    "Sub-Millisecond Optical Switching: flipping light onto a new path in under a thousandth of a second.",
  ],
];
function rg(f) {
  $("#gc").innerHTML = GL.filter((g) => !f || g[0] == f)
    .map(
      (g) =>
        `<div class=gl style="margin:6px 0"><b class=mono>${g[0]}</b><br>${g[1]}</div>`,
    )
    .join("");
}
$("#gf").innerHTML = ["All", ...GL.map((g) => g[0])]
  .map((t) => `<button class="${t == "All" ? "on" : ""}">${t}</button>`)
  .join("");
$$("#gf button").forEach(
  (b) =>
    (b.onclick = () => {
      $$("#gf button").forEach((x) => x.classList.toggle("on", x == b));
      rg(b.textContent == "All" ? "" : b.textContent);
    }),
);
rg("");
const QZ = [
  [
    "How much transcontinental internet traffic do subsea cables carry?",
    ["About 5%", "Over 95%", "About 50%"],
    1,
    "Over 95%. Satellites carry only a small share.",
    0,
  ],
  [
    "What does DAS stand for?",
    [
      "Digital Audio System",
      "Deep Anchor Scanner",
      "Distributed Acoustic Sensing",
    ],
    2,
    "Distributed Acoustic Sensing turns the whole fiber into a microphone.",
    1,
  ],
  [
    "Why can a long fiber notice a small vibration?",
    [
      "It changes the light's timing over a long distance",
      "Light stops moving",
      "Fish send a signal",
    ],
    0,
    "Over a very long cable, even a tiny vibration shifts the light's timing enough to measure.",
    1,
  ],
  [
    "What can a falling SNR warn about?",
    [
      "The cable is getting faster",
      "The signal is getting noisier, so something may be failing",
      "Nothing",
    ],
    1,
    "A lower signal-to-noise ratio means the signal is less clear, an early sign of trouble.",
    2,
  ],
  [
    "How fast can optical switches move traffic to a backup route?",
    ["Hours", "Minutes", "Under a millisecond"],
    2,
    "Optical switches flip light onto a new path in under a thousandth of a second.",
    3,
  ],
];
let qi = 0,
  sc = 0,
  wr = [];
function rq() {
  const z = $("#qz");
  if (qi >= QZ.length) {
    z.innerHTML = `<h3>Score: ${sc}/${QZ.length}</h3><p>${wr.length ? "Topics to review: " + [...new Set(wr)].map((i) => LS[i][0]).join("; ") : "Perfect! You can explain how AI protects the deep-sea backbone."}</p><button id=qr>Try again</button> <button id=qs>Replay Simulator</button>`;
    $("#qr").onclick = () => {
      qi = sc = 0;
      wr = [];
      rq();
    };
    $("#qs").onclick = () => replay(wr.length ? wr[0] : 3);
    return;
  }
  const q = QZ[qi];
  z.innerHTML = `<small>Question ${qi + 1} of ${QZ.length}</small><p><b>${q[0]}</b></p><div id=qo class=chs style="flex-direction:column;align-items:stretch">${q[1].map((o, i) => `<button data-i=${i}>${o}</button>`).join("")}</div><p id=qe></p>`;
  $$("#qo button").forEach(
    (b) =>
      (b.onclick = () => {
        const ok = +b.dataset.i == q[2];
        $$("#qo button").forEach((x) => (x.disabled = true));
        if (ok) sc++;
        else wr.push(q[4]);
        ok ? chime() : bloop();
        $("#qe").innerHTML =
          (ok ? "✅ Correct. " : "❌ Not quite. ") +
          q[3] +
          "<br><button id=qn>Next</button>";
        $("#qn").onclick = () => {
          qi++;
          rq();
        };
      }),
  );
}
function replay(i) {
  go("sim");
  reset();
  if (i == 0) {
    $("#ld").value = 100;
    load = 1;
    $("#lt").textContent = "100%";
    say("Lesson 1: with traffic at 100%, see how much data the cables carry.");
  } else if (i == 3) quake();
  else {
    if (!ae) $("#ai").click();
    if (i == 2) {
      gt.tg.set(AP.x, 1, AP.z);
      gt.r = 30;
    }
  }
}
