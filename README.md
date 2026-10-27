# BunnyBuddy – Android ad

Everything on screen is the real `index.html` (unmodified) running in an iframe inside a CSS Android phone frame.

## Run
Serve this folder (the iframe and localStorage need `http://`, not `file://`):

    python3 -m http.server 8000
    # open http://localhost:8000/ad.html

## Modes
- `?record=1`  hides controls, locks a 1080×1920 (9:16) stage.
- `?wide=1`    1920×1080 (16:9) layout. Combine: `?record=1&wide=1`.
- `?noloop=1`  play once, no loop.

## Export to MP4
OBS: Window/Browser capture of the page at `?record=1`, canvas 1080×1920, 60 fps, record, then convert.
Or Chrome DevTools: open the Rendering/Recorder panel, or use any screen recorder on a 1080×1920 window.

## Tune timing and captions
All in `ad.js`, in `play()`: each beat is a block with `caption('…')`, `camTo(x,y,zoom,ms)` and `wait(ms)`.
Phone size: `#cam{scale}` in `ad.css`. Reduced-motion users get the same story at 1.5× slower.

## Files
`ad.html` `ad.css` `ad.js` · `assets/app-icon.png` (your icon, untouched) · `icon-192.png` (downscaled from it, for the app's own favicon).
