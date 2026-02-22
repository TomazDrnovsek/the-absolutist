# The Absolutist

A perceptual color-matching instrument built on functional, objective design principles. 

This application functions as both a game and a precision tool, training the eye to recognize color harmonies (Complementary, Analogous, Triadic) without relying on traditional labels. It treats the digital screen as a mechanical canvas—utilizing absolute grid alignment, strict geometric primitives, and minimalist typography.

## Features

* **Perceptual Color Engine:** Match target harmonies using pure HSL slider inputs, grounded in the color theories of Josef Albers and Johannes Itten.
* **Objective Interface:** A stripped-down, purely functional UI featuring a strict modular grid, raw monochrome ink (`#121212`), and zero decorative noise.
* **Geometric Verification:** Mathematical "Schematic Links" prove color relationships geometrically upon success, replacing arbitrary gaming animations with logical feedback.
* **Artifact Export:** Players can authenticate their sessions by generating and downloading high-resolution PNG posters of their completed color geometries.

## Tech Stack

* **Frontend:** React (TypeScript)
* **Styling:** Tailwind CSS
* **Export:** `html2canvas` for native artifact generation
* **Build:** Vite / ES Modules