/**
 * model.test.js — Unit tests for the UGF model (Node.js, no framework needed).
 * Run with: node model.test.js
 */

const UGF = require('./model.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function assertClose(a, b, tol, message) {
  const ok = Math.abs(a - b) / (Math.abs(b) || 1) < tol;
  if (ok) {
    console.log(`  ✓ ${message}  (${a.toPrecision(4)} ≈ ${b.toPrecision(4)})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}  got ${a}, expected ≈ ${b} (tol=${tol})`);
    failed++;
  }
}

// ── Constants ─────────────────────────────────────────────────
console.log('\n[constants]');
assert(typeof UGF.CONSTANTS === 'object', 'CONSTANTS is an object');
assertClose(UGF.CONSTANTS.c,     2.998e8,  1e-3, 'speed of light');
assertClose(UGF.CONSTANTS.G,     6.674e-11,1e-3, 'gravitational constant');
assertClose(UGF.CONSTANTS.alpha, 7.2974e-3,1e-3, 'fine-structure constant');
assertClose(UGF.CONSTANTS.H0,    67.4,     1e-3, 'Hubble constant');

// ── Force strengths ───────────────────────────────────────────
console.log('\n[forceStrengthsAt]');
const f1fm = UGF.forceStrengthsAt(1e-15);
assert(f1fm.gravity > 0,         'gravity is positive at 1 fm');
assert(f1fm.electromagnetic > 0, 'EM is positive at 1 fm');
assert(f1fm.strong > 0,          'strong force is positive at 1 fm');
assert(f1fm.weak > 0,            'weak force is positive at 1 fm');
// Strong >> gravity at nuclear scale
assert(Math.abs(f1fm.strongRatio) > Math.abs(f1fm.gravityRatio), 'strong > gravity at 1 fm');
// EM >> gravity at nuclear scale
assert(Math.abs(f1fm.electromagneticRatio) > Math.abs(f1fm.gravityRatio), 'EM > gravity at 1 fm');

// ── Gravity ───────────────────────────────────────────────────
console.log('\n[ugfGravity]');
const m = UGF.CONSTANTS.m_p;
const F_1fm  = UGF.ugfGravity(m, m, 1e-15);
const F_2fm  = UGF.ugfGravity(m, m, 2e-15);
assert(F_1fm > F_2fm, 'gravity decreases with distance');
// Should be close to Newton at large distances
const F_1m_ugf  = UGF.ugfGravity(1, 1, 1);
const F_1m_newt = UGF.CONSTANTS.G;
assertClose(F_1m_ugf, F_1m_newt, 1e-10, 'gravity ≈ Newton at 1 m (Planck correction negligible)');

// ── Hubble rate ───────────────────────────────────────────────
console.log('\n[hubbleRate / hubbleRateLCDM]');
const H0_ugf  = UGF.hubbleRate(0);
const H0_lcdm = UGF.hubbleRateLCDM(0);
assertClose(H0_ugf,  67.4, 0.01, 'UGF H(z=0) ≈ H0');
assertClose(H0_lcdm, 67.4, 0.01, 'ΛCDM H(z=0) ≈ H0');
const Hz1_ugf  = UGF.hubbleRate(1);
const Hz1_lcdm = UGF.hubbleRateLCDM(1);
assert(Hz1_ugf > H0_ugf,   'UGF H(z=1) > H(z=0)');
assert(Hz1_lcdm > H0_lcdm, 'ΛCDM H(z=1) > H(z=0)');
assert(Hz1_ugf > Hz1_lcdm, 'UGF H(z=1) > ΛCDM H(z=1) — geometric term adds rate');

// ── Hubble series ─────────────────────────────────────────────
console.log('\n[hubbleSeries]');
const series = UGF.hubbleSeries(0, 2, 20);
assert(series.length === 21, 'series has 21 points (0..20 inclusive)');
assert(series[0].z === 0,    'first point at z=0');
assertClose(series[series.length - 1].z, 2, 1e-9, 'last point at z=2');
assert(series.every(p => p.H_ugf > 0),  'all UGF H values positive');
assert(series.every(p => p.H_lcdm > 0), 'all ΛCDM H values positive');

// ── Energy density data ───────────────────────────────────────
console.log('\n[energyDensityData]');
const edd = UGF.energyDensityData();
assert(Array.isArray(edd.labels),    'labels is array');
assert(edd.radiation.length > 0,     'radiation array non-empty');
assert(edd.geometric.length > 0,     'geometric array non-empty');
// Each column should sum to ~1
const eps = 0.01;
for (let i = 0; i < edd.labels.length; i++) {
  const sum = edd.radiation[i] + edd.matter[i] + edd.darkEnergy[i] + edd.geometric[i];
  assertClose(sum, 1, eps, `energy fractions sum to 1 at ${edd.labels[i]}`);
}

// ── Force comparison chart data ───────────────────────────────
console.log('\n[forceComparisonData]');
const fcd = UGF.forceComparisonData();
assert(fcd.labels.length === 10,        '10 scale labels');
assert(fcd.gravity.length === 10,       'gravity array has 10 entries');
assert(fcd.electromagnetic.length === 10,'em array has 10 entries');
assert(fcd.strong.length === 10,        'strong array has 10 entries');
assert(fcd.weak.length === 10,          'weak array has 10 entries');

// ── Hubble chart data ─────────────────────────────────────────
console.log('\n[hubbleChartData]');
const hcd = UGF.hubbleChartData();
assert(hcd.labels.length === 61,    'hubble chart has 61 points');
assert(hcd.H_ugf.length === 61,     'H_ugf has 61 points');
assert(hcd.deviation.length === 61, 'deviation has 61 points');

// ── Particle simulation ───────────────────────────────────────
console.log('\n[simulation]');
const p = UGF.createParticle(0, 800, 600, { x: 400, y: 300, vx: 1, vy: 0, mass: 1, charge: 1, radius: 6 });
assert(p.x === 400,   'particle x position');
assert(p.y === 300,   'particle y position');
assert(p.charge === 1,'particle charge');
assert(p.mass === 1,  'particle mass');

const particles = [
  UGF.createParticle(0, 800, 600, { x: 300, y: 300, vx: 0, vy: 0, mass: 1, charge:  1, radius: 6 }),
  UGF.createParticle(1, 800, 600, { x: 500, y: 300, vx: 0, vy: 0, mass: 1, charge: -1, radius: 6 }),
];
const x0 = particles[0].x;
UGF.stepSimulation(particles, 0.016, 800, 600, { G2d: 500, k2d: 800, forceExp: 1.5, damping: 0.99, softening: 20 });
assert(particles[0].x !== x0, 'particles move after step');

// ── Summary ───────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}
