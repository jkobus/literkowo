import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/LICENSE', ['LICENSE', 'text/plain']],
  ['/debug.html', ['debug.html', 'text/html']],
  ['/debug.css', ['debug.css', 'text/css']],
  ['/debug.js', ['debug.js', 'text/javascript']],
  ['/debug-mode.js', ['debug-mode.js', 'text/javascript']],
  ['/debug-mode.css', ['debug-mode.css', 'text/css']],
  ['/style.css', ['style.css', 'text/css']],
  ['/theme.css', ['theme.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']],
  ...['gaze.js', 'animal-art.js', 'animals-extended.js', 'animals-more.js', 'habitats.js'].map(name => ['/' + name, [name, 'text/javascript']]),
  ['/animals.js', ['animals.js', 'text/javascript']],
  ['/play-state.js', ['play-state.js', 'text/javascript']],
  ['/keyboard-protection.js', ['keyboard-protection.js', 'text/javascript']],
]);
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  const entry = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(new URL(entry[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Nie można odczytać pliku.'); }
}).listen(port, '127.0.0.1', () => console.log(`Literkowo: http://localhost:${port}`));
