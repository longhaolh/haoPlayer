// Build a fully static bundle deployable under a sub-path (default /haoplayer).
// Usage:  node scripts/deploy-build.mjs [base]   e.g.  node scripts/deploy-build.mjs /haoplayer
// Result: dist/ contains index.html + hashed assets + poster/songs media + getMusicList.json,
//         ready to be served by nginx as a plain static directory (no Node needed).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const BASE = (process.argv[2] || '/haoplayer').replace(/\/+$/, '');

process.env.VITE_BASE = BASE + '/';
process.env.VITE_API_BASE = BASE;
execSync('npm run build', { cwd: root, stdio: 'inherit' });

const dist = path.join(root, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(root, 'musicList.json'), 'utf8'));
const list = data.musicList.map((item) => ({
  ...item,
  id: randomUUID(),
  posterUrl: item.poster ? `${BASE}/assets/poster/${item.poster}` : '',
  songUrl: item.songUrl ? `${BASE}/assets/songs/${item.songUrl}` : '',
  lyric: fs.readFileSync(path.join(root, 'src/assets/Lyric', item.lyric), 'utf8'),
}));
fs.writeFileSync(path.join(dist, 'getMusicList.json'), JSON.stringify(list));

for (const dir of ['poster', 'songs']) {
  fs.cpSync(path.join(root, 'src/assets', dir), path.join(dist, 'assets', dir), { recursive: true });
}
console.log(`\nStatic bundle ready at ${dist} (mounted at ${BASE}/)`);