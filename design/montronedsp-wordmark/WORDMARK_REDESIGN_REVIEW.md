# MontroneDSP master wordmark

**Recommendation for approval · Direction C, Bespoke modern classic.** The small rise at the inside of the M, the spring of the R leg and the lowered DSP carry the signature. A 5.2° incline gives the whole name one direction. In the website header the letters hold together in flat white, with the facets of the diamond providing the only change of tone. [Preferred artwork](proofs/preferred.png) · [Compare the three directions](proofs/three-directions.png) · [Website previews](proofs/site-contexts.png)

## The existing drawing

The shared header at website revision `f09fbabd46347aaf86e50dc11c354398f5bc396d` uses the mono SVG. Its face is condensed and strongly weighted. The M lands on the baseline in the middle, the O has a tall oval counter, and DSP sits distinctly below the E. These are the features that make the name recognizable across the old assets. The master and mono versions share the main word outline. The older mobile artwork places a small waveform diamond between the two parts of the name. The SWARA concave variant also shows an earlier treatment of the suffix. [Source SVG](../../assets/branding/montrone_dsp_logo_header_mono.svg) · [Original at 2×](reference/original-lockup-2x.png) · [Reference proof](reference/original.png)

The brief identifies Roboto Condensed Bold Italic as the origin. The current website asset contains paths. Its M outer stem leans about 9.8° and the D stem about 16.2°, despite the “upright” title. The drawing repeats both words four times. A 3-unit rounded outline adds weight, a shadow shifts 2.6 and 2.8 units, a light edge shifts −0.9 and −1.1, and the main face is white with a gray suffix. At desktop width the gray face and white rim give DSP a different texture. At mobile width the two edges collapse into much the same pixels.

## Proportions

Measurements below are visible bounds in SVG units, relative to the upper-left corner of the header canvas. The original canvas starts at (26.78, 94.95). All header studies retain its 726.61 × 164.20 size.

| Measure | Existing | Final |
|---|---:|---:|
| Diamond, width × height including perimeter | 112.20 × 122.20 | 112.20 × 122.20 |
| Horizontal gap, diamond to lettering | 29.77 | 30.80 |
| Lettering, width × height including suffix and any painted edges | 512.26 × 81.66 | 526.98 × 78.85 |
| Width ratio, diamond / lettering | 0.219 | 0.213 |
| MONTRONE face, visible height | 65.52 | 70.17 |
| DSP face, visible height | 36.02 | 45.17 |

The width ratio changes by 2.7%. Most of the additional ink at small sizes goes into the suffix. Its baseline sits 9.2 design units below MONTRONE. The diamond keeps its original perimeter, aperture, corner flats and facet coordinates. The header master also retains its four original fills. In the solid variants the four touching facets are painted as one compound path to prevent hairline seams.

## The lettering studies

- **A · Heritage refinement.** The deep M, 8° incline and taller, narrower O stay closest to the current signature. The fuller DSP survives reduction better than the rimmed original. Across N–T–R the steep stems and close cap edges retain the strongest suggestion of speed. [Study A](concepts/A-study.png)
- **B · Precision instrument.** At 3.8°, long straight O flanks repeat the stems of the two Ns. The lifted M junction opens its base. The suffix is easy to separate at header size. The very even counter shapes and straight R leg make this the quietest drawing, but they take some personality out of the name. [Study B](concepts/B-study.png)
- **C · Bespoke modern classic.** The initial 5.8° drawing gives the two O shoulders different tensions. The R bowl flows into a shaped leg. A slight rounding inside T and E ties the straights to the curves. The first T and R came too close at cap height, particularly against black. This was the clearest issue to resolve before selecting C. [Study C](concepts/C-study.png)

Scores are a design judgment on a ten-point scale. Weights follow the commission.

| Study | Continuity 20% | Craft 25% | Audio identity 20% | Freedom from racing cues 15% | Small sizes 10% | Icon fit 10% | Weighted |
|---|---:|---:|---:|---:|---:|---:|---:|
| A | 9 | 7 | 6 | 5 | 7 | 8 | 7.00 |
| B | 7 | 8 | 8 | 9 | 8 | 8 | 7.95 |
| C, first drawing | 8 | 8 | 9 | 8 | 7 | 9 | 8.20 |
| C, refined master | 8 | 9 | 9 | 8 | 8 | 9 | 8.55 |

## Final drawing

The main stems occupy roughly one fifth of cap height. The E middle bar is thinner and shorter than the bottom arm. The R has a small radius where the leg leaves the bowl, and the O curves extend 1.75 units beyond a nominal 100-unit cap at both ends. Opening the O counter and lifting the M’s inner return keep those heavier letters from forming dark spots in print.

Both O–N pairs share the same fit. M–O and R–O tuck into the curved shoulder. N–T and T–R have extra air at cap height, where their full-width tops otherwise crowd together. The narrowest inter-letter clearance increases from 1.35 SVG units in the first C drawing to 4.20 in the final. The E middle arm stops early enough to leave a visible opening above the D.

DSP has its own drawings for the smaller size. The D has a straight left stem and an open, bowed right side. The S has level terminals. The P counter is broad with a slightly higher lower edge. Both words share the 5.2° incline. The larger suffix and extra space on either side of S do more for legibility than the old outline. [First and final details](proofs/drawing-revisions.png)

## Masters and proofs

| Application | Artwork |
|---|---|
| Dark website header, original faceted diamond | [Lockup SVG](master/montronedsp-lockup.svg) |
| One-color lockup | [Black SVG](master/lockup-black.svg) · [White SVG](master/lockup-white.svg) |
| Lettering alone, tight artboard | [Black SVG](master/montronedsp-wordmark.svg) · [White SVG](master/wordmark-white.svg) |
| Transparent 3000 px exports | [Master files](master/) |
| Native-size comparison | [Scale sheet](proofs/scale-sheet.png) · [Actual website headers](proofs/website-headers.png) |

Each study also includes editable standalone lettering and lockup SVGs. The masters use one closed compound path per letter, flattened into final position. All eleven SVGs were parsed and checked for closed contours, valid sampled polygons, counter winding and separation between glyphs. The faceted icon’s five path definitions and paint attributes were compared with the source. CairoSVG rendered the sheets, Inkscape independently rendered the selected master, and Edge rendered the website proofs.

## Header fit and limits

The real site reserves 170 × 38.41 CSS pixels on desktop and 100 × 22.59 on mobile. The original and candidate occupy the same image box. The final header was checked on the homepage at 1440, 390 and 320 px, SWARA XT at 1280 px, MX2 at 1024 px, About at 900 px and Contact at 390 px. Checks covered device scales 1, 1.25, 1.5 and 2 in Windows Edge. Captures show the shared desktop and mobile navigation with space around the mark. The scale sheet also covers complete lockup heights of 24, 32, 48, 64 and 128 px.

At the site's 100 px width DSP has about 6.2 CSS pixels of ink height. It reads as a suffix, but its counters are near the limit on a 1× display. High-density displays give it more samples. For processes with material-dependent tolerances, such as engraving or cutting vinyl, a physical proof at the intended size is still needed.

For a local live review, run `python design/montronedsp-wordmark/preview.py` from the repository root and open [the preview](http://127.0.0.1:63126/). The server substitutes the selected SVG only for the shared header request. Use `--artwork original`, `A`, `B` or `C` to compare with the final master.
