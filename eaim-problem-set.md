# E-AIM Problem Set — Aerosol Water, pH, and Phase

This file has two parts:

1. **Walkthroughs** — click-by-click instructions for each E-AIM run so you can generate and screenshot the graphs yourself. I can't drive the E-AIM web forms, so the screenshots are on you.
2. **Written answers** — interpretations for parts (a), (b), (c), (d), and (e). Placeholders marked `[...]` in part (a) are for the numbers you read off the E-AIM output.

All three E-AIM model links used here are the ones given in the prompt. Model III is fixed at 298.15 K; Model II is used in part (c) because it allows temperature sweeps.

---

## Part (a) — Single-point runs at 50% RH (Model III)

**URL:** http://www.aim.env.uea.ac.uk/aim/model3/model3a.php

### Walkthrough (run the form three times, once per composition)

1. Open the URL. You should see the single-point Model III calculation form.
2. Under the ion-moles inputs, enter the composition for the current run and leave every other field at 0:

   | Aerosol            | H⁺    | NH₄⁺  | Na⁺ | SO₄²⁻ | NO₃⁻  | Cl⁻ |
   |--------------------|-------|-------|-----|-------|-------|-----|
   | (i)  NH₄NO₃        | 0     | 1e-6  | 0   | 0     | 1e-6  | 0   |
   | (ii) NH₄HSO₄       | 1e-6  | 1e-6  | 0   | 1e-6  | 0     | 0   |
   | (iii) (NH₄)₂SO₄    | 0     | 2e-6  | 0   | 1e-6  | 0     | 0   |

   NH₄HSO₄ fully dissociates to NH₄⁺ + H⁺ + SO₄²⁻, so all three fields are 1e-6. (NH₄)₂SO₄ gives 2 mol NH₄⁺ per mol salt.

3. Set relative humidity to **0.50**.
4. Scroll to the bottom. **Check every "omit / do not form" box for the solid phases.** The assignment requires the fully metastable (aqueous) solution for every composition, so none of the solids can precipitate.
5. Click **Calculate**.
6. From the output page, record:
   - `moles of H⁺` in the aqueous phase
   - `grams of H₂O` (total water content — the model reports this directly; if it only reports moles of H₂O, multiply by 18.015 g/mol)

### Data table (fill in after each run)

| Aerosol         | moles H⁺ | grams H₂O | L H₂O (= g/1000) | [H⁺] = mol/L | pH      |
|-----------------|----------|-----------|------------------|--------------|---------|
| NH₄NO₃          |  [...]   |   [...]   |       [...]      |    [...]     |  [...]  |
| NH₄HSO₄         |  [...]   |   [...]   |       [...]      |    [...]     |  [...]  |
| (NH₄)₂SO₄       |  [...]   |   [...]   |       [...]      |    [...]     |  [...]  |

**Formulas**
- L H₂O = (grams H₂O) / 1000, assuming ρ_water ≈ 1 g/mL
- [H⁺] = (moles H⁺) / (L H₂O)
- pH = −log₁₀([H⁺])

### Interpretation

**Acidity ranking — you should find NH₄HSO₄ ≪ (NH₄)₂SO₄ ≲ NH₄NO₃ in pH (i.e. NH₄HSO₄ is by far the most acidic).**

- **NH₄HSO₄** is strongly acidic, with pH typically in the range 0–1. This is because bisulfate is a moderately strong acid: HSO₄⁻ ⇌ H⁺ + SO₄²⁻ with pKa₂ ≈ 1.99. Every NH₄HSO₄ droplet therefore contains a large amount of free H⁺.
- **(NH₄)₂SO₄** is mildly acidic, with pH typically around 4–5. Sulfate is the conjugate base of a strong acid, so it barely hydrolyzes. The only source of acidity is NH₄⁺ hydrolysis (Ka ≈ 5.6e-10), which is a very small effect.
- **NH₄NO₃** is nearly neutral, with pH also in the 5-ish range. Both NO₃⁻ (conjugate base of the strong acid HNO₃) and NH₄⁺ (very weak acid) contribute essentially no acidity on their own, so the droplet is close to neutral.

**Water uptake — you should find NH₄HSO₄ ≳ NH₄NO₃ > (NH₄)₂SO₄ in water content per mole of aerosol at 50 % RH (with solids suppressed).**

The reason is their intrinsic hygroscopicities / deliquescence RHs. At 298 K, DRH(NH₄HSO₄) ≈ 40 %, DRH(NH₄NO₃) ≈ 62 %, DRH((NH₄)₂SO₄) ≈ 80 %. At 50 % RH, NH₄HSO₄ and NH₄NO₃ are (close to) their stable deliquesced states, while (NH₄)₂SO₄ is forced metastable well below its DRH and holds comparatively little water. The ion-per-formula-unit count (3 for (NH₄)₂SO₄, 2 for the others) partially compensates but not enough to overcome the DRH difference at 50 % RH.

**Why the three aerosols differ**

The differences come from two independent properties: (1) the acid/base character of the anion and (2) the DRH / hygroscopicity of the salt.

- Bisulfate is the only anion that is itself a real acid. That is why NH₄HSO₄ has low pH and the other two don't.
- DRH is set by lattice energy / activity-coefficient effects specific to each crystal. (NH₄)₂SO₄'s high DRH reflects a stable, tightly bound crystal structure; NH₄NO₃'s low DRH reflects a loosely bound, very hygroscopic crystal. That is why (NH₄)₂SO₄ stays (meta)dry longest and NH₄NO₃ picks up water at the lowest RH.

---

## Part (b) — Deliquescence via RH sweep (Model III)

**URL:** http://www.aim.env.uea.ac.uk/aim/model3/mod3rhw.php

### Run 1 — NH₄NO₃

1. Composition: NH₄⁺ = 1e-6, NO₃⁻ = 1e-6, everything else 0.
2. Start RH = **0.50**, End RH = **0.70**, number of points = **60**.
3. Output type: **Graph**.
4. **Check the HNO₃ and NH₃ boxes** so those gases are prevented from partitioning to the vapor phase (forces all the nitrogen to stay in the particle so you see a clean deliquescence transition).
5. Select y-axis and run twice:
   - **Graph 1:** RH vs moles of NH₄NO₃ (solid).
   - **Graph 2:** RH vs moles of H₂O.
6. Screenshot both and paste them into the problem set under part (b).

### Run 2 — (NH₄)₂SO₄

Same procedure, but:
- Composition: NH₄⁺ = 2e-6, SO₄²⁻ = 1e-6.
- Start RH = **0.50**, End RH = **0.90**, number of points = **60**.
- Same two graphs: RH vs moles of (NH₄)₂SO₄ (solid), and RH vs moles of H₂O.

### Interpretation

**What the NH₄NO₃ graphs tell you about DRH:** Moles of solid NH₄NO₃ drop discontinuously from ~1e-6 to 0 near **RH ≈ 62 %**, and moles of H₂O jump discontinuously from essentially 0 to a finite value at the same RH. That sharp step is the deliquescence relative humidity: the RH at which the solid salt spontaneously dissolves into a saturated aqueous droplet. **DRH(NH₄NO₃, 298 K) ≈ 62 %.**

**How (NH₄)₂SO₄ differs:** The same kind of discontinuous transition appears, but at a much higher RH — around **80 %**. Moles of solid (NH₄)₂SO₄ stay at 1e-6 until ~80 % RH and then drop to zero; water stays near zero until ~80 % RH and then jumps up. **DRH((NH₄)₂SO₄, 298 K) ≈ 80 %.**

In practical terms, NH₄NO₃ exists as an aqueous droplet across most ambient conditions, while (NH₄)₂SO₄ stays a dry crystal until the air is quite humid. That is the key reason NH₄NO₃ is considered the more hygroscopic inorganic salt at typical atmospheric humidities.

---

## Part (c) — Temperature sweep at 70 % RH (Model II)

**URL:** http://www.aim.env.uea.ac.uk/aim/model2/mod2t.php

### Walkthrough

1. Composition: NH₄⁺ = 1e-6, NO₃⁻ = 1e-6.
2. Relative humidity: **0.70**.
3. T start = **270** K, T end = **320** K, number of points = **50**.
4. Output type: **Graph**.
5. **Do not** suppress gas-phase NH₃ and HNO₃ this time — you need to see them grow.
6. Run the calculation five times, picking a different y-axis each run:
   - **Graph 1:** T vs moles of NH₄NO₃(s).
   - **Graph 2:** T vs moles of NH₄⁺(aq), default (log) y-axis.
   - **Graph 3:** T vs moles of NH₄⁺(aq), **linear** y-axis.
   - **Graph 4:** T vs moles of NH₃(g).
   - **Graph 5:** T vs moles of HNO₃(g).
7. Screenshot each and paste them into the problem set under part (c).

### Interpretation

**What is happening at T = 284 K:** 284 K is where the DRH of NH₄NO₃ equals the ambient 70 % RH. Below 284 K the DRH of NH₄NO₃ is higher than 70 % (DRH rises as T drops), so the salt sits as a crystal: moles of NH₄NO₃(s) ≈ 1e-6, moles of NH₄⁺(aq) ≈ 0, water content is tiny. Right at 284 K the crystal deliquesces: moles of solid NH₄NO₃ drop abruptly to 0, and moles of aqueous NH₄⁺ jump discontinuously up to ~1e-6. **T = 284 K is the deliquescence transition temperature at 70 % RH.**

**What happens as T rises above 284 K:** The aerosol is now fully aqueous. As temperature increases, the equilibrium

$$\mathrm{NH_4NO_3(aq) \;\rightleftharpoons\; NH_3(g) + HNO_3(g)}$$

shifts to the right because the dissociation/volatilization is endothermic (ΔH > 0); K_p grows strongly with T. On the graphs you should see moles of NH₄⁺(aq) steadily drop (clearest on the linear-scale Graph 3), while moles of NH₃(g) and HNO₃(g) steadily grow. The particle-phase ammonium nitrate is progressively evaporating into the gas phase.

**What happens at T ≈ 311 K:** At about 311 K the evaporation is essentially complete. Moles of NH₄⁺(aq) approach zero and moles of NH₃(g) and HNO₃(g) each plateau near 1e-6 mol (the full initial amount). Above ~311 K effectively all of the nitrogen is in the gas phase as NH₃ + HNO₃; no particle-phase nitrate remains.

---

## Part (d) — RH sweep at 298 K with gases allowed (Model III)

**URL:** http://www.aim.env.uea.ac.uk/aim/model3/mod3rhw.php

### Walkthrough

1. Composition: NH₄⁺ = 1e-6, NO₃⁻ = 1e-6.
2. Start RH = **0.20**, End RH = **0.99**, number of points = **50**.
3. Output type: **Graph**.
4. **Do not** check the HNO₃ / NH₃ boxes this time — you want to see them partition.
5. Generate three graphs:
   - **Graph 1:** RH vs moles of NH₄NO₃(s).
   - **Graph 2:** RH vs moles of NH₃(g), y-axis = **log₁₀**.
   - **Graph 3:** RH vs moles of HNO₃(g), y-axis = **log₁₀**.
6. Screenshot each and paste them into the problem set under part (d).

### Interpretation — what is happening at RH ≈ 62 %

62 % RH is the DRH of NH₄NO₃ at 298 K. Below 62 % RH the salt is solid: moles of NH₄NO₃(s) sit near 1e-6, water content is tiny, and a small but measurable amount of NH₃(g) and HNO₃(g) is present from solid–vapor equilibrium. As RH crosses ~62 %:

- Moles of NH₄NO₃(s) drop sharply to zero — the crystal deliquesces into an aqueous droplet.
- Moles of NH₃(g) and HNO₃(g) **drop sharply**, often by two or more orders of magnitude on the log plot. The newly formed droplet dissolves NH₄⁺ and NO₃⁻ very efficiently; the equilibrium NH₃(g) + HNO₃(g) ⇌ NH₄⁺(aq) + NO₃⁻(aq) shifts hard to the right the moment liquid water appears.
- Above 62 % RH the droplet is fully aqueous and grows more dilute as RH rises, which lowers ion activities and pulls even more NH₃ and HNO₃ out of the vapor phase, so gas-phase concentrations continue to fall.

62 % RH is therefore a phase transition: ammonium nitrate snaps from a dry crystal (with a measurable gas-phase tail) to an aqueous droplet that efficiently scrubs NH₃ and HNO₃ out of the air.

---

## Part (e) — Central Valley diurnal cycle

**Morning:** 45 °F ≈ 7.2 °C ≈ **280 K**, RH ≈ **77 %**.
**Afternoon:** 75 °F ≈ 23.9 °C ≈ **297 K**, RH ≈ **27 %**.

Applying parts (c) and (d):

- **Morning (cold and humid, 280 K / 77 % RH).** T is well below the 311 K regime where NH₄NO₃ evaporates, and — importantly — 77 % RH is above the deliquescence RH of NH₄NO₃ at that temperature, so the aerosol is in its aqueous form with plenty of water to dissolve ions. Both levers therefore push the equilibrium NH₃(g) + HNO₃(g) ⇌ NH₄NO₃(aerosol) to the right: NH₄NO₃ aerosol loading should be high and gas-phase NH₃ and HNO₃ should be very low.
- **Afternoon (warm and dry, 297 K / 27 % RH).** Now both levers push the other way. The temperature has risen into the range where part (c) showed significant evaporative loss of aqueous NH₄NO₃, and the RH has dropped well below the 62 % DRH from part (d), so any droplet has lost its water. NH₄NO₃ partitions back out as NH₃(g) + HNO₃(g): aerosol nitrate plummets while gas-phase NH₃ and HNO₃ shoot up.

**So the diurnal picture in the Central Valley is:** ammonium nitrate is an overnight/morning aerosol. Cool, humid mornings trap NH₃ and HNO₃ in the particle phase as NH₄NO₃ droplets, which is why particulate nitrate (and the overall PM₂.₅ mass it dominates) peaks in the early morning. As the afternoon warms and dries, the equilibrium flips — the aerosol evaporates back to gas-phase NH₃ and HNO₃, and particulate nitrate drops to a daytime minimum. The same mechanism explains why wintertime inversions in places like Salt Lake City produce severe NH₄NO₃-dominated PM₂.₅ episodes: sustained cold, humid, stagnant air keeps the equilibrium locked deep on the particle side for days at a time.
