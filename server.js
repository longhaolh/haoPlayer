import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 静态资源目录
app.use('/assets', express.static(join(__dirname, 'src/assets')));
// 读取音乐列表并添加完整路径和UUID
const rawData = fs.readFileSync(join(__dirname, 'musicList.json'), 'utf8');
const musicData = JSON.parse(rawData);

// 处理音乐列表，添加完整URL路径和UUID
const processedMusicList = musicData.musicList.map(item => {
  // 读取lyric的内容
  const lyricContent = fs.readFileSync(join(__dirname, `src/assets/Lyric/${item.lyric}`), 'utf8');
  return {
    ...item,
    id: uuidv4(),
    posterUrl: item.poster ? `http://localhost:${PORT}/assets/poster/${item.poster}` : '',
    songUrl: item.songUrl ? `http://localhost:${PORT}/assets/songs/${item.songUrl}` : '',
    lyric: lyricContent
  };
});

// 获取音乐列表
app.get('/getMusicList', (req, res) => {
  res.json(processedMusicList);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`资源服务器运行在 http://localhost:${PORT}`);
  console.log(`音乐文件可通过 http://localhost:${PORT}/assets/songs/ 访问`);
  console.log(`歌词文件可通过 http://localhost:${PORT}/assets/Lyric/ 访问`);
  console.log(`封面图片可通过 http://localhost:${PORT}/assets/poster/ 访问`);
});