import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

// Publish only the browser application, never development files or server code.
const assets = ['index.html', 'theme.css', 'style.css', 'app.js', 'animals.js', 'gaze.js', 'animal-art.js', 'animals-extended.js', 'animals-more.js', 'habitats.js', 'play-state.js', 'keyboard-protection.js', 'debug.html', 'debug.css', 'debug.js', 'debug-mode.js', 'debug-mode.css', 'LICENSE'];
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const contents = await Promise.all(assets.map(name => readFile(new URL(name, root))));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(assets.map((name, index) => writeFile(new URL(name, output), contents[index])));
console.log(`Gotowe: dist/ (${assets.length} plików). Statyczna gra do hostowania przez HTTPS.`);
