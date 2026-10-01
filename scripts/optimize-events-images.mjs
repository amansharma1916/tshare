/**
 * Optimize static event images — resize + convert to WebP (q80).
 *
 * Why: the original images are far larger than what the UI displays,
 * e.g. inkhub-dragon-tattoo-banner.png is a 1.7 MB / 2166x726 PNG but is
 * shown at ~350-640px wide on mobile. WebP at display resolution (2x for
 * retina) is ~90-97% smaller.
 *
 * Run with:  npm run optimize:images
 *
 * Outputs `<file>.webp` next to each source (originals are kept).
 */
import sharp from 'sharp'
import path from 'node:path'
import { statSync } from 'node:fs'

const srcDir = path.resolve('public/events')

// Output width = 2x the largest CSS display width (retina). Widths:
// - banner   : shown full-width (~350-640px)          -> 800
// - side ads : shown at clamp(160px,17vw,240px)       -> 480
// - poster   : modal max 460px wide                   -> 920
const targets = [
  { file: 'inkhub-dragon-tattoo-banner.png', out: 'inkhub-dragon-tattoo-banner.webp', width: 800 },
  { file: 'inkhub-tattoos-left-ad.jpg',      out: 'inkhub-tattoos-left-ad.webp',      width: 480 },
  { file: 'inkhub-tattoos-right-ad.jpg',     out: 'inkhub-tattoos-right-ad.webp',     width: 480 },
  { file: 'inkhub-tattoos-promo.jpg',        out: 'inkhub-tattoos-promo.webp',        width: 920 },
  { file: 'inkhub-tattoos-25.jpg',           out: 'inkhub-tattoos-25.webp',           width: 920 },
  { file: 'inkhub-tattoos-sumit.jpg',        out: 'inkhub-tattoos-sumit.webp',        width: 920 },
]

const kb = (p) => `${(statSync(p).size / 1024).toFixed(1)} KB`

console.log('File                        |   Before  |   After   | Saved')
console.log('----------------------------|-----------|-----------|------')

for (const t of targets) {
  const src = path.join(srcDir, t.file)
  const dest = path.join(srcDir, t.out)
  const before = statSync(src).size

  await sharp(src)
    .rotate() // apply EXIF orientation
    .resize({ width: t.width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest)

  const after = statSync(dest).size
  const saved = (100 - (after / before) * 100).toFixed(1)
  const pad = t.out.padEnd(27)
  console.log(`${pad} | ${kb(src).padStart(9)} | ${kb(dest).padStart(9)} | ${saved}%`)
}

console.log('\nDone. WebP files written next to sources (originals kept).')
console.log('Update src references to the .webp files (see MobileBanner.jsx, SharePageAds.jsx, EventPosterModal.jsx).')