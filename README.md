# Alt_percep

> **Alternative perception of the grand architecture of the physics of the universe.**

This project presents the **Unified Geometric Field (UGF)** model — a theoretical framework proposing that all four fundamental forces (gravity, electromagnetism, strong, and weak) are emergent phenomena arising from spacetime curvature at different geometric scales.

---

## 🚀 Quick Start

Open the HTML files in any modern browser — no build step or server required:

| File | Description |
|------|-------------|
| [`index.html`](index.html) | **Data Explorer** — interactive charts & reference tables (Goal 1) |
| [`simulator.html`](simulator.html) | **UGF Simulator** — live particle field simulation (Goal 3) |
| [`model.js`](model.js) | **Core model** — UGF equations & computation functions (Goal 2) |
| [`style.css`](style.css) | Shared dark-theme stylesheet |

For a local server (optional):
```sh
npx serve .
# or
python3 -m http.server 8080
```

---

## 📊 Goal 1 — Data Explorer (`index.html`)

An interactive webpage for viewing the UGF model data:

- **Force Strength Chart** — relative strengths of all four forces across 10 decades of length scale
- **Hubble Rate Chart** — UGF-modified Friedmann expansion vs standard ΛCDM
- **Energy Density Chart** — fractional cosmic energy budgets across epochs
- **UGF vs ΛCDM Deviation** — percentage difference in expansion history
- **Reference tables** — physical constants and model parameters

---

## ⚙️ Goal 2 — Working Model (`model.js`)

A self-contained JavaScript module implementing the UGF physics model:

### Core equations

```
F_ugf(r)  = κ · (l_P / r)^n          geometric coupling function
H²(z)     = H₀² [Ω_m(1+z)³ + Ω_Λ + Ω_geo(1+z)^(4/3)]   modified Friedmann
F_grav    = G·m₁m₂/r² · [1 + κ_g·(l_P/r)²]   UGF gravity
F_strong  = α_s·ℏc/r² · e^(-r/r_s) · (1 + κ_s)   UGF strong force
```

### Usage in browser

```html
<script src="model.js"></script>
<script>
  // Force strengths at 1 fm
  const f = UGF.forceStrengthsAt(1e-15);
  console.log(f.strongRatio);   // → ~10^38

  // Hubble rate at z=1
  const H = UGF.hubbleRate(1);  // km/s/Mpc

  // Cosmological series
  const series = UGF.hubbleSeries(0, 3, 60);
</script>
```

### Usage in Node.js

```js
const UGF = require('./model.js');
console.log(UGF.CONSTANTS.c);  // 299800000 m/s
```

---

## 🎮 Goal 3 — Interactive Simulator (`simulator.html`)

A live 2-D particle field simulation demonstrating the UGF force law:

- **Real-time physics** — particles interact via UGF gravity + EM-like coupling
- **Adjustable parameters** — gravity strength, EM coupling, force exponent, damping
- **5 presets** — Default, Gravity-dominated, EM-dominated, Planck-scale, Chaotic
- **Click to add particles** — left-click for positive, shift+click for negative
- **Spawn Cluster** button — drops 6 new particles near the canvas centre
- **Hubble Rate Explorer** — tune Ω_m, Ω_Λ, Ω_geo, H₀ and watch the expansion history update live

---

## 🧪 Running Tests

```sh
node model.test.js
```

---

## 📐 Model Summary

| Force | Scale | Mechanism | κ | n |
|-------|-------|-----------|---|---|
| Gravity | Large (>1 mm) | Riemannian curvature | 1.0 | 2 |
| Electromagnetism | Medium | Torsional oscillations | 1/137 | 1 |
| Strong | ~1 fm | Curvature nodes | 1.0 | 0 |
| Weak | <0.1 fm | Curvature transitions | 1.18×10⁻⁵ | 0.5 |

---

## License

MIT — see [LICENSE](LICENSE).
