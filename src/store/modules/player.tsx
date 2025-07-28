import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const playerStore = createSlice({
  name: "player",
  initialState: {
    isPlay: false,
    currentTime: 0,
    duration: 0,
    musicList: [],
    currentMusic: {},
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
      const res = await axios.get("http://localhost:3000/getMusicList");
      if (res.data.length > 0) {
        dispatch(setMusicList(res.data));
        // 只有当没有当前音乐时才设置第一首为当前音乐
        const state = getState();
        if (!state.player.currentMusic || !state.player.currentMusic.id) {
          dispatch(setCurrentMusic(res.data[0]));
        }
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
