/**
 * Alt_percep — Unified Geometric Field (UGF) Model
 *
 * This model proposes that all four fundamental forces are emergent phenomena
 * arising from spacetime curvature at different geometric scales:
 *
 *   Gravity        → large-scale Riemannian curvature
 *   Electromagnetism → medium-scale torsional oscillations
 *   Strong force    → micro-scale curvature nodes (gluon knots)
 *   Weak force      → micro-scale curvature transitions
 *
 * All computations use SI units unless otherwise specified.
 */

const UGF = (() => {
  "use strict";

  // ── Physical constants ────────────────────────────────────────────────────
  const CONSTANTS = {
    c: 2.998e8,           // speed of light (m/s)
    G: 6.674e-11,         // gravitational constant (N·m²/kg²)
    hbar: 1.0546e-34,     // reduced Planck constant (J·s)
    k_e: 8.988e9,         // Coulomb's constant (N·m²/C²)
    alpha: 7.2974e-3,     // fine-structure constant
    alpha_s: 0.118,       // strong coupling constant
    m_p: 1.6726e-27,      // proton mass (kg)
    m_e: 9.109e-31,       // electron mass (kg)
    e: 1.602e-19,         // elementary charge (C)
    k_B: 1.38065e-23,     // Boltzmann constant (J/K)
    H0: 67.4,             // Hubble constant (km/s/Mpc) — Planck 2018
    Lambda: 1.089e-52,    // cosmological constant (m⁻²)
    l_P: 1.616e-35,       // Planck length (m)
    t_P: 5.391e-44,       // Planck time (s)
    E_P: 1.956e9,         // Planck energy (J)
  };

  // ── UGF model parameters ──────────────────────────────────────────────────
  // κ_n: geometric curvature coupling at scale n (dimensionless)
  const MODEL_PARAMS = {
    kappa_gravity:  1.0,
    kappa_em:       1.0 / 137,
    kappa_strong:   1.0,
    kappa_weak:     1.18e-5,
    // Geometric scale exponents
    n_gravity:  2,
    n_em:       1,
    n_strong:   0,
    n_weak:     0.5,
    // UGF base curvature radius (Planck units)
    R0: 1.0,
  };

  // ── Core UGF equations ────────────────────────────────────────────────────

  /**
   * Geometric coupling strength at a given length scale r (metres).
   * F_ugf(r) = kappa * (l_P / r)^n
   */
  function geometricCoupling(r, kappa, n) {
    return kappa * Math.pow(CONSTANTS.l_P / r, n);
  }

  /**
   * UGF gravitational force between two masses at distance r.
   */
  function ugfGravity(m1, m2, r) {
    const F_newton = CONSTANTS.G * m1 * m2 / (r * r);
    const correction = 1 + geometricCoupling(r, MODEL_PARAMS.kappa_gravity, MODEL_PARAMS.n_gravity);
    return F_newton * correction;
  }

  /**
   * UGF electromagnetic force between two charges at distance r.
   */
  function ugfElectromagnetic(q1, q2, r) {
    const F_coulomb = CONSTANTS.k_e * q1 * q2 / (r * r);
    const correction = 1 + geometricCoupling(r, MODEL_PARAMS.kappa_em, MODEL_PARAMS.n_em);
    return F_coulomb * correction;
  }

  /**
   * UGF strong force (simplified Yukawa-like with geometric node term).
   * F_strong(r) = alpha_s * hbar*c / r^2 * exp(-r/r_s) * (1 + kappa_s*(l_P/r)^0)
   * where r_s ≈ 1 fm.
   */
  function ugfStrong(r) {
    const r_s = 1e-15; // 1 femtometre (confinement radius)
    const base = CONSTANTS.alpha_s * CONSTANTS.hbar * CONSTANTS.c / (r * r);
    const yukawa = Math.exp(-r / r_s);
    const correction = 1 + MODEL_PARAMS.kappa_strong;
    return base * yukawa * correction;
  }

  /**
   * UGF weak force (Fermi-like with geometric transition factor).
   */
  function ugfWeak(r) {
    const G_F = 1.1664e-5; // Fermi constant (GeV⁻²) — scaled to SI approximation
    const m_W = 80.4e9 * CONSTANTS.e / (CONSTANTS.c * CONSTANTS.c); // W boson mass in kg
    const r_W = CONSTANTS.hbar / (m_W * CONSTANTS.c); // W boson range
    const base = G_F * Math.exp(-r / r_W) / (r * r);
    const correction = 1 + geometricCoupling(r, MODEL_PARAMS.kappa_weak, MODEL_PARAMS.n_weak);
    return Math.abs(base) * correction;
  }

  /**
   * Relative force strength normalised to gravity at 1 fm.
   * Returns an object with all four force strengths and their ratios.
   */
  function forceStrengthsAt(r) {
    const r_ref = 1e-15;
    const F_g  = ugfGravity(CONSTANTS.m_p, CONSTANTS.m_p, r);
    const F_em = ugfElectromagnetic(CONSTANTS.e, CONSTANTS.e, r);
    const F_s  = ugfStrong(r);
    const F_w  = ugfWeak(r);
    const F_g_ref = ugfGravity(CONSTANTS.m_p, CONSTANTS.m_p, r_ref);
    return {
      gravity:         F_g,
      electromagnetic: F_em,
      strong:          F_s,
      weak:            F_w,
      gravityRatio:         F_g  / F_g_ref,
      electromagneticRatio: F_em / F_g_ref,
      strongRatio:          F_s  / F_g_ref,
      weakRatio:            F_w  / F_g_ref,
    };
  }

  /**
   * UGF cosmic expansion rate as a function of redshift z.
   * Modified Friedmann: H(z)² = H0² [Ω_m(1+z)³ + Ω_Λ + Ω_geo(1+z)^(4/3)]
   * where Ω_geo encodes geometric curvature correction (replaces dark energy partially).
   */
  function hubbleRate(z, params = {}) {
    const H0  = params.H0  ?? CONSTANTS.H0;
    const Om  = params.Om  ?? 0.315;   // matter density
    const OL  = params.OL  ?? 0.685;   // cosmological constant density
    const Og  = params.Og  ?? 0.02;    // geometric curvature term (UGF-specific)
    const H2 = H0 * H0 * (
      Om * Math.pow(1 + z, 3) +
      OL +
      Og * Math.pow(1 + z, 4 / 3)
    );
    return Math.sqrt(H2);
  }

  /**
   * Standard ΛCDM Hubble rate for comparison.
   */
  function hubbleRateLCDM(z, params = {}) {
    const H0 = params.H0 ?? CONSTANTS.H0;
    const Om = params.Om ?? 0.315;
    const OL = params.OL ?? 0.685;
    return H0 * Math.sqrt(Om * Math.pow(1 + z, 3) + OL);
  }

  /**
   * Generate an array of { z, H_ugf, H_lcdm, deviation } over a z range.
   */
  function hubbleSeries(zMin = 0, zMax = 3, steps = 60, params = {}) {
    const result = [];
    for (let i = 0; i <= steps; i++) {
      const z = zMin + (zMax - zMin) * (i / steps);
      const H_ugf  = hubbleRate(z, params);
      const H_lcdm = hubbleRateLCDM(z, params);
      result.push({
        z,
        H_ugf,
        H_lcdm,
        deviation: ((H_ugf - H_lcdm) / H_lcdm) * 100, // percent
      });
    }
    return result;
  }

  // ── 2-D particle simulation ───────────────────────────────────────────────

  /**
   * Create a particle with random position/velocity inside a canvas.
   */
  function createParticle(id, canvasW, canvasH, opts = {}) {
    return {
      id,
      x: opts.x ?? Math.random() * canvasW,
      y: opts.y ?? Math.random() * canvasH,
      vx: opts.vx ?? (Math.random() - 0.5) * 2,
      vy: opts.vy ?? (Math.random() - 0.5) * 2,
      mass: opts.mass ?? (0.5 + Math.random() * 1.5),
      charge: opts.charge ?? (Math.random() < 0.5 ? 1 : -1),
      radius: opts.radius ?? 6,
      color: opts.color ?? null,
    };
  }

  /**
   * Compute net force on particle i from all other particles.
   * Uses a simplified 2-D UGF force law:
   *   F = (G_2d * m_i * m_j / r^n) + (k_2d * q_i * q_j / r^n)
   * with softening ε to avoid singularities.
   */
  function computeForce(particles, i, opts = {}) {
    const G2d  = opts.G2d   ?? 500;
    const k2d  = opts.k2d   ?? 800;
    const n    = opts.forceExp ?? 1.5;
    const eps  = opts.softening ?? 20;
    let fx = 0, fy = 0;
    const pi = particles[i];
    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      const pj = particles[j];
      const dx = pj.x - pi.x;
      const dy = pj.y - pi.y;
      const r2 = dx * dx + dy * dy + eps * eps;
      const r  = Math.sqrt(r2);
      const rn = Math.pow(r, n);
      // gravity-like (always attractive)
      const Fg = G2d * pi.mass * pj.mass / rn;
      // EM-like (attractive for opposite charges, repulsive for same)
      const Fe = k2d * pi.charge * pj.charge / rn;
      const F  = (Fg - Fe) / r;
      fx += F * dx;
      fy += F * dy;
    }
    return { fx, fy };
  }

  /**
   * Advance simulation by one time-step dt using Euler integration.
   * Reflects particles off canvas walls.
   */
  function stepSimulation(particles, dt, canvasW, canvasH, opts = {}) {
    const damping = opts.damping ?? 0.99;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const { fx, fy } = computeForce(particles, i, opts);
      p.vx = (p.vx + (fx / p.mass) * dt) * damping;
      p.vy = (p.vy + (fy / p.mass) * dt) * damping;
      p.x += p.vx;
      p.y += p.vy;
      // Boundary reflection
      if (p.x - p.radius < 0)        { p.x = p.radius;          p.vx *= -0.8; }
      if (p.x + p.radius > canvasW)  { p.x = canvasW - p.radius; p.vx *= -0.8; }
      if (p.y - p.radius < 0)        { p.y = p.radius;           p.vy *= -0.8; }
      if (p.y + p.radius > canvasH)  { p.y = canvasH - p.radius; p.vy *= -0.8; }
    }
  }

  // ── Data sets for the visualization page ─────────────────────────────────

  /**
   * Force strength comparison data across 10 decades of length scale.
   * Returns { labels, gravity, em, strong, weak } arrays (log10 of strength ratio).
   */
  function forceComparisonData() {
    const scales = [1e-18, 1e-17, 1e-16, 1e-15, 1e-14, 1e-13, 1e-12, 1e-10, 1e-8, 1e-6];
    const labels = scales.map(r => `10^${Math.round(Math.log10(r))} m`);
    const g = [], em = [], s = [], w = [];
    for (const r of scales) {
      const f = forceStrengthsAt(r);
      const ref = Math.abs(f.gravityRatio) || 1;
      g.push(Math.log10(Math.abs(f.gravityRatio) + 1e-50));
      em.push(Math.log10(Math.abs(f.electromagneticRatio) + 1e-50));
      s.push(Math.log10(Math.abs(f.strongRatio) + 1e-50));
      w.push(Math.log10(Math.abs(f.weakRatio) + 1e-50));
    }
    return { labels, gravity: g, electromagnetic: em, strong: s, weak: w };
  }

  /**
   * UGF vs ΛCDM Hubble series data for chart.
   */
  function hubbleChartData(params = {}) {
    const series = hubbleSeries(0, 3, 60, params);
    return {
      labels:    series.map(d => d.z.toFixed(2)),
      H_ugf:     series.map(d => d.H_ugf),
      H_lcdm:    series.map(d => d.H_lcdm),
      deviation: series.map(d => d.deviation),
    };
  }

  /**
   * Energy density fractions across cosmic eras (scale factor a).
   * UGF replaces part of dark energy with geometric term.
   */
  function energyDensityData() {
    const aValues = [0.001, 0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
    const labels  = aValues.map(a => `a=${a}`);
    const radiation = aValues.map(a => 9.2e-5 / (a * a * a * a));
    const matter    = aValues.map(a => 0.315   / (a * a * a));
    const darkEnergy = aValues.map(a => 0.685);
    const geometric = aValues.map(a => 0.02 * Math.pow(a, -1 / 3));
    // Normalise to sum = 1 per column
    const normalised = aValues.map((_, i) => {
      const total = radiation[i] + matter[i] + darkEnergy[i] + geometric[i];
      return {
        radiation:   radiation[i]   / total,
        matter:      matter[i]      / total,
        darkEnergy:  darkEnergy[i]  / total,
        geometric:   geometric[i]   / total,
      };
    });
    return {
      labels,
      radiation:   normalised.map(d => d.radiation),
      matter:      normalised.map(d => d.matter),
      darkEnergy:  normalised.map(d => d.darkEnergy),
      geometric:   normalised.map(d => d.geometric),
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    CONSTANTS,
    MODEL_PARAMS,
    // Force computations
    ugfGravity,
    ugfElectromagnetic,
    ugfStrong,
    ugfWeak,
    forceStrengthsAt,
    // Cosmology
    hubbleRate,
    hubbleRateLCDM,
    hubbleSeries,
    // Simulation
    createParticle,
    stepSimulation,
    // Chart data helpers
    forceComparisonData,
    hubbleChartData,
    energyDensityData,
  };
})();

// CommonJS export (for Node.js testing)
if (typeof module !== "undefined") {
  module.exports = UGF;
}
