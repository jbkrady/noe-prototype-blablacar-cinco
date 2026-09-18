// Exporte les écrans du Figma « BlaBlaCar 5 » en PNG (×2) dans design-ref/screens/.
// Usage : node scripts/export-figma.mjs            → écrans
//         node scripts/export-figma.mjs --icons    → icônes de la tab bar (UI Kit) en SVG dans src/assets/tabbar/
// Le token Figma est demandé au lancement, jamais enregistré.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE_KEY = 'UnHpC3FL9BRJzvbNZ0vnNv'
const SCALE = 2
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'design-ref', 'screens')

// Frames exportés directement
const FRAMES = [
  '143:1156', '2:4111', '2:4116', '2:4117', '2:4119', '2:4123', '2:4124', '2:4126', '333:3118', '333:3168',
  '2:4130', '2:4132', '2:4134', '333:3058', '333:3072', '2:4149', '10:1087', '10:1088', '372:3368',
  '146:2015', '146:2016', '146:2018', '10:1089', '10:1090', '333:3031', '86:1851', '372:3230',
  '13:1251', '196:2642', '13:1426', '13:1315', '13:1248', '13:1459', '13:1535', '70:1631', '173:2213',
  '156:2691', '156:2879', '156:2904',
]

// Section « Modification de profil » : des calques sont posés par-dessus les frames,
// on exporte donc la section entière puis on découpe chaque écran (x, y, largeur, hauteur).
const SECTION = '8:1109'
const CROPS = {
  '92:1751': [119, 85, 360, 941],
  '92:1680': [2535, 85, 360, 1002],
  '92:1584': [525, 85, 360, 780],
  '92:1664': [927, 85, 360, 780],
  '92:1667': [1329, 85, 360, 780],
  '92:1665': [1731, 85, 360, 780],
  '199:940': [2133, 85, 360, 780],
}

// Icônes « ICONS/TAB BAR/… » de la page UI KIT (versions active / inactive)
const ICONS = {
  'search-on': '2:2867', 'search-off': '2:3521',
  'publish-on': '2:3649', 'publish-off': '2:3577',
  'trips-on': '2:3332', 'trips-off': '2:2756',
  'messages-on': '2:3361', 'messages-off': '2:3531',
  'profile-on': '2:3513', 'profile-off': '2:3442',
}
const ICONS_OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'tabbar')

const askToken = () =>
  new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question('Colle ton token Figma puis appuie sur Entrée : ', t => {
      rl.close()
      resolve(t.trim())
    })
  })

const token = process.env.FIGMA_TOKEN || (await askToken())
if (!token) {
  console.error('Aucun token fourni.')
  process.exit(1)
}

if (process.argv.includes('--icons')) {
  console.log('Demande des icônes à Figma (1 seul appel)…')
  const r = await fetch(`https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(Object.values(ICONS).join(','))}&format=svg`, {
    headers: { 'X-Figma-Token': token },
  })
  const b = await r.json()
  if (!r.ok || b.err) {
    console.error(`Erreur Figma (${r.status}) :`, b.err || b.message || b)
    process.exit(1)
  }
  mkdirSync(ICONS_OUT, { recursive: true })
  for (const [name, id] of Object.entries(ICONS)) {
    const svg = await fetch(b.images[id]).then(x => x.text())
    writeFileSync(join(ICONS_OUT, `${name}.svg`), svg)
    console.log(`  ✓ ${name}.svg`)
  }
  console.log('✅ Terminé : 10 icônes dans src/assets/tabbar/')
  process.exit(0)
}

const ids = [...FRAMES, SECTION].join(',')
console.log('Demande des rendus à Figma (1 seul appel)…')
const res = await fetch(`https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&scale=${SCALE}&format=png`, {
  headers: { 'X-Figma-Token': token },
})
const body = await res.json()
if (!res.ok || body.err) {
  console.error(`Erreur Figma (${res.status}) :`, body.err || body.message || body)
  if (res.status === 403) console.error('→ Vérifie que le token a bien le droit « File content : Read-only ».')
  if (res.status === 429) console.error('→ Limite d\'appels atteinte, réessaie plus tard.')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
const download = async (url, path) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`téléchargement impossible (${r.status})`)
  writeFileSync(path, Buffer.from(await r.arrayBuffer()))
}

let ok = 0
for (const id of FRAMES) {
  const url = body.images[id]
  if (!url) { console.warn(`  ⚠ pas de rendu pour ${id}`); continue }
  await download(url, join(OUT, `${id.replace(':', '-')}.png`))
  ok++
  process.stdout.write(`\r  ${ok}/${FRAMES.length + Object.keys(CROPS).length} écrans`)
}

// Découpe de la section avec sips (outil d'image intégré à macOS)
const sectionPng = join(OUT, '_section.png')
await download(body.images[SECTION], sectionPng)
for (const [id, [x, y, w, h]] of Object.entries(CROPS)) {
  const dest = join(OUT, `${id.replace(':', '-')}.png`)
  execFileSync('sips', [
    '--cropOffset', String(y * SCALE), String(x * SCALE),
    '-c', String(h * SCALE), String(w * SCALE),
    sectionPng, '--out', dest,
  ], { stdio: 'ignore' })
  ok++
  process.stdout.write(`\r  ${ok}/${FRAMES.length + Object.keys(CROPS).length} écrans`)
}
rmSync(sectionPng)
console.log(`\n✅ Terminé : ${ok} écrans dans design-ref/screens/`)
