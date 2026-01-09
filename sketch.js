const margin = {
  left: 70,
  right: 30,
  top: 40,
  bottom: 100
};

window.addEventListener("deviceorientation", function (e) {
  e.preventDefault();
}, true);

window.addEventListener("devicemotion", function (e) {
  e.preventDefault();
}, true);
let useDeviceOrientation = false;
let useDeviceMotion = false;

let useSI = false;
let mode = 1;
let showMethods = false;
const W = 1.618;
const accent = [31, 119, 180];

let traj = [];

let overlayAlpha = 140;

function toggleMethods() {
  showMethods = !showMethods;
}

function toggleUnits() {
  useSI = !useSI;
  const btn = document.getElementById("btn-units");
  btn.innerText = useSI ? "Units: SI" : "Units: Normalized";
}

function setup() {
  let c = createCanvas(640, 420);
  c.parent("canvas-holder");
  resetConvergence();
}

function draw() {

  /* --- background --- */
  background(245);

  /* --- plot frame (journal-style light boundary) --- */
  stroke(220);
  strokeWeight(1);
  noFill();
  rect(
    margin.left,
    margin.top,
    width - margin.left - margin.right,
    height - margin.top - margin.bottom
  );

  /* --- mode indicator (debug / optional) --- */
  fill(0);
  noStroke();
  textSize(12);
  text("Mode " + mode, 18, 20);

  /* --- figure dispatch --- */
  switch (mode) {
    case 1:
      drawConvergence();
      break;
    case 2:
      drawStructural();
      break;
    case 3:
      drawAeolian();
      break;
    case 4:
      drawPhase();
      break;
  }
}


function drawMethodsOverlay(eqText, refText) {
  if (!showMethods) return;

  noStroke();
  fill(0, 140);
  rect(
  margin.left,
  height - margin.bottom + 5,
  width - margin.left - margin.right,
  32,
  6
);

  fill(255);
  textSize(11);
  textAlign(LEFT, TOP);
  text(eqText, width - 288, 18);
  textSize(10);
  fill(220);
  text(refText, width - 288, 36);
}

function resetConvergence() {
  traj = [];

  let GRV = random(0.8, 2.0);
  let GRC = random(0.8, 2.0);

  for (let i = 0; i < 200; i++) {
    let ratio = GRV / GRC;
    let delta = 0.05 * (W - ratio);
    GRV += delta;
    GRC -= delta;
    traj.push(GRV / GRC);
  }
}

function exportPNG() {
  saveCanvas("GME_Figure_" + mode, "png");
}

function exportSVG() {
  saveCanvas("GME_Figure_" + mode, "svg");
}

function drawAxes(
  xLabel, yLabel,
  xMin, xMax,
  yMin, yMax,
  xTicks = 5,
  yTicks = 5
) {

  push();
  stroke(0);
  strokeWeight(1);
  fill(0);
  textSize(11);

  // --- AXIS LINES ---
  line(
    margin.left,
    height - margin.bottom,
    width - margin.right,
    height - margin.bottom
  );

  line(
    margin.left,
    margin.top,
    margin.left,
    height - margin.bottom
  );

  // --- X TICKS ---
  for (let i = 0; i <= xTicks; i++) {
    let v = lerp(xMin, xMax, i / xTicks);
    let x = map(v, xMin, xMax,
                margin.left, width - margin.right);

    line(
      x,
      height - margin.bottom,
      x,
      height - margin.bottom + 5
    );

    textAlign(CENTER, TOP);
    text(
      nf(v, 0, 2),
      x,
      height - margin.bottom + 8
    );
  }

  // --- Y TICKS ---
  for (let i = 0; i <= yTicks; i++) {
    let v = lerp(yMin, yMax, i / yTicks);
    let y = map(v, yMin, yMax,
                height - margin.bottom, margin.top);

    line(
      margin.left,
      y,
      margin.left - 5,
      y
    );

    textAlign(RIGHT, CENTER);
    text(
      nf(v, 0, 2),
      margin.left - 8,
      y
    );
  }

  // --- LABELS ---
  textAlign(CENTER, TOP);
  text(
    xLabel,
    (margin.left + width - margin.right) / 2,
    height - margin.bottom + 32
  );

  push();
  translate(margin.left - 42, height / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  text(yLabel, 0, 0);
  pop();

  pop();
}


/* -------- FIGURE 1 -------- */
function drawConvergence() {

  stroke(0);
  strokeWeight(1);
  noFill();

  beginShape();
  for (let i = 0; i < traj.length; i++) {

    let x = map(i, 0, traj.length - 1,
                margin.left, width - margin.right);

    let y = map(traj[i], 1.0, 2.2,
                height - margin.bottom, margin.top);

    vertex(x, y);
  }
  endShape();

  // Golden Measure reference line
  stroke(accent);
  let yW = map(W, 1.0, 2.2, height - margin.bottom, margin.top);
  line(margin.left, yW, width - margin.right, yW);

  // Axes (THIS WAS MISSING)
  stroke(0);
  strokeWeight(1);
  drawAxes(
  "Iteration n (–)",
  useSI ? "GRV / GRC (dimensionless)" : "GRV / GRC (–)",
  0, traj.length - 1,
  1.0, 2.2,
  5, 6
);


  drawCaption(
    "Figure 1 · Morphogenetic convergence under the Golden Measure Equation",
    useSI
      ? "Representation: SI-consistent (dimensionless ratio, physical interpretation)"
      : "Representation: normalized (dimensionless)"
  );

  drawMethodsOverlay(
    "limₙ→∞ (GRVₙ₊₁ / GRCₙ) → W",
    "Eq. (1), Methods §2.1 – Golden Measure Equation"
  );
}


/* -------- FIGURE 2 -------- */
function drawStructural() {
  stroke(0);
  strokeWeight(1);
  noFill();

  beginShape();
  for (let i = 0; i <= 20; i++) {

    let t = 0.02 + i * 0.003;     // meters, never zero
    let dEff = 1.0 / t;          // guaranteed finite

    let x = map(
      t,
      0.02, 0.08,
      margin.left,
      width - margin.right
    );

    let y = map(
      dEff,
      10, 50,
      height - margin.bottom,
      margin.top
    );

    vertex(x, y);
  }
  endShape();

  drawAxes(
    useSI ? "Shell thickness t (m)" : "Normalized thickness t* (–)",
    "Effective dimensionality dₑff (–)"
  );

  drawCaption(
    "Figure 2 · Structural translation of GME into shell mechanics",
    useSI ? "Representation: SI thickness, dimensionless dimensionality"
          : "Representation: normalized thickness"
  );

  drawMethodsOverlay(
    "dₑff ∝ 1 / t",
    "Eq. (5), Methods §2.3 – Structural mapping"
  );

  drawAxes(
  useSI ? "Shell thickness t (m)" : "Normalized thickness t* (–)",
  "Effective dimensionality dₑff (–)",
  0.02, 0.08,     // x-range used in plotting
  10, 50,         // y-range used in plotting
  4, 5
);
}

function drawAeolian() {

  stroke(0);
  strokeWeight(1);
  noFill();

  beginShape();
  for (let i = 0; i <= 200; i++) {

    let fNorm = i / 200;
    let force = useSI ? fNorm * 20.0 : fNorm;
    let amplitude = sin(fNorm * PI);

    let x = map(
      force,
      useSI ? 0 : 0,
      useSI ? 20 : 1,
      margin.left,
      width - margin.right
    );

    let y = map(amplitude, -1, 1,
                height - margin.bottom, margin.top);

    vertex(x, y);
  }
  endShape();

  /* ---- admissibility band ---- */
  noStroke();
  fill(accent[0], accent[1], accent[2], 50);
  rect(
    margin.left,
    height - margin.bottom + 5,
    width - margin.left - margin.right,
    32,
    6
  );

  /* ---- axes (single, authoritative) ---- */
  stroke(0);
  strokeWeight(1);
  drawAxes(
    useSI ? "Wind excitation F (N)" : "Normalized wind excitation F* (–)",
    useSI
      ? "Displacement amplitude A (m, normalized)"
      : "Normalized amplitude A* (–)",
    useSI ? 0 : 0,
    useSI ? 20 : 1,
    -1, 1,
    5, 5
  );

  drawCaption(
    "Figure 3 · Aeolian canopy response constrained by GME admissibility",
    useSI
      ? "Representation: SI-scaled excitation, normalized displacement"
      : "Representation: fully normalized"
  );

  drawMethodsOverlay(
    "|∂(GRV/GRC)/∂n| < C₁",
    "Eq. (7), Methods §2.4 – Aeolian admissibility"
  );
}


/* -------- FIGURE 4 -------- */
function drawPhase() {
  stroke(0);
  strokeWeight(1);
  noFill();

  if (!traj || traj.length < 3) return;

  beginShape();
  for (let i = 1; i < traj.length - 1; i++) {

    let d2 = traj[i + 1] - 2 * traj[i] + traj[i - 1];

    let x = map(
      i,
      1, traj.length - 2,
      margin.left,
      width - margin.right
    );

    let y = map(
      d2,
      -0.02, 0.02,
      height - margin.bottom,
      margin.top
    );

    vertex(x, y);
  }
  endShape();

  drawAxes(
    "Iteration n (–)",
    useSI ? "Second derivative (scaled)" : "Second derivative (–)"
  );

  drawCaption(
    "Figure 4 · Derivative-based identification of morphogenetic phase boundaries",
    useSI ? "Representation: scaled SI-consistent derivatives"
          : "Representation: normalized derivatives"
  );

  drawMethodsOverlay(
    "∂²(GRV/GRC)/∂n² = 0",
    "Eq. (9), Methods §2.5 – Morphogenetic transitions"
  );
  drawAxes(
  "Iteration n (–)",
  useSI
    ? "Second derivative (scaled)"
    : "Second derivative (–)",
  1, traj.length - 2,
  -0.02, 0.02,
  6, 4
);
}


function drawCaption(title, subtitle) {

  stroke(220);
line(margin.left, height - 52, width - margin.right, height - 52);
  push();
  fill(0);
  textSize(11);
  textAlign(CENTER, TOP);

  let yBase = height - 40;   // fixed caption band

  text(title, width / 2, yBase);

  if (subtitle) {
    textSize(10);
    fill(80);
    text(subtitle, width / 2, yBase + 14);
  }

  pop();
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-units").onclick = toggleUnits;
  document.getElementById("btn-methods").onclick = toggleMethods;
  document.getElementById("btn-export-png").onclick = exportPNG;
  document.getElementById("btn-export-svg").onclick = exportSVG;
});
