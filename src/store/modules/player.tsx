import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// dev: resource server (server.js); deploy: sub-path like /haoplayer
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export interface Music {
  id: string;
  name: string;
  singer: string;
  songUrl: string;
  posterUrl?: string;
  lyric?: string;
}

const playerStore = createSlice({
  name: "player",
  initialState: {
    isPlay: false,
    currentTime: 0,
    duration: 0,
    musicList: [] as Music[],
    currentMusic: {} as Music,
    volume: 0.3,
    playMode: "normal",
    show: false,
  },
  reducers: {
    setIsPlay: (state, action) => {
      state.isPlay = action.payload;
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setMusicList: (state, action) => {
      state.musicList = action.payload;
    },
    setCurrentMusic: (state, action) => {
      state.currentMusic = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setPlayMode: (state, action) => {
      state.playMode = action.payload;
    },
    setShow: (state, action) => {
      state.show = action.payload;
    },
  },
});
// 异步action
const getMusicList = () => {
  // @ts-expect-error 忽略ts错误
  return async (dispatch, getState) => {
    try {
      const res = await axios.get(`${API_BASE}/getMusicList.json`);
      if (res.data.length > 0) {
        dispatch(setMusicList(res.data));
        // 用最新列表数据校准持久化的当前歌曲（歌词/资源地址可能已更新），
        // 匹配不到（如换歌或删除）则回退第一首
        const state = getState();
        const persisted = state.player.currentMusic;
        const fresh =
          persisted && persisted.name
            ? res.data.find(
                (m: any) => m.name === persisted.name && m.singer === persisted.singer
              )
            : null;
        dispatch(setCurrentMusic(fresh || res.data[0]));
      }
    } catch (error) {
      console.error("获取音乐列表失败:", error);
    }
  };
};
const {
  setMusicList,
  setCurrentMusic,
  setIsPlay,
  setDuration,
  setCurrentTime,
  setVolume,
  setPlayMode,
  setShow,
} = playerStore.actions;
export {
  getMusicList,
  setIsPlay,
  setCurrentMusic,
  setVolume,
  setDuration,
  setCurrentTime,
  setPlayMode,
  setShow,
};
export default playerStore.reducer;
