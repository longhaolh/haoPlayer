# HaoPlayer - 在线音乐播放器

- 歌曲来源:[https://tonzhon.com/](https://tonzhon.com/)
- 歌词来源:豆包AI、[https://tonzhon.com/](https://tonzhon.com/)、[歌词网](https://zh.followlyrics.com/)
- 歌曲封面:豆包AI
- 声明:歌曲仅供学习交流 如有侵权 联系[haosion@hotmail.com](haosion@hotmail.com)删除

## 效果演示

[【React19+Redux(含持久化)实战项目-浩音乐】](https://www.bilibili.com/video/BV1JG8HzSEJY/?share_source=copy_web&vd_source=f5ba953af0ca76ef903f85ddff96e791)

## 如何运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动资源服务器

```bash
npm run server
```

资源服务器会在 http://localhost:3000 启动，提供以下资源：

- 音乐文件：http://localhost:3000/assets/songs/
- 歌词文件：http://localhost:3000/assets/Lyric/
- 封面图片：http://localhost:3000/assets/poster/

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 (默认Vite端口) 启动。

## 如何使用URL方式引用资源

本项目使用Express服务器将本地资源文件通过HTTP提供，这样就可以使用URL方式引用资源

### 资源URL格式

```typescript
// 资源服务器基础URL
const ASSETS_BASE_URL = 'http://localhost:3000/assets';

// 音乐文件URL
const songUrl = `${ASSETS_BASE_URL}/songs/歌曲名.mp3`;

// 歌词文件URL
const lyricsUrl = `${ASSETS_BASE_URL}/Lyric/歌词文件.lrc`;

// 封面图片URL
const posterUrl = `${ASSETS_BASE_URL}/poster/封面图.png`;
```

## 部署到服务器

当部署到服务器时，只需要：

1. 将 `src/assets` 目录上传到服务器
2. 配置服务器提供这些静态资源
3. 更新 `ASSETS_BASE_URL` 为实际服务器地址

例如，如果你的资源托管在 `https://your-server.com/music-assets`，则：

```typescript
const ASSETS_BASE_URL = 'https://your-server.com/music-assets';
```

## 技术栈

- React
- TypeScript
- Vite
- Express (资源服务器)
