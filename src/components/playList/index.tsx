import { type FC } from "react";
import styles from "./style.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentMusic, setIsPlay } from "@/store/modules/player";
import "@/assets/iconfonts/iconfont.js";

const PlayList: FC = () => {
  const dispatch = useDispatch();
  const { show, musicList, currentMusic, isPlay } = useSelector(
    (state) => state.player
  );
  const getDuration = (id: string) => {
    const audio = document.getElementById(`music_${id}`) as HTMLAudioElement;
    //   获取音频时长
    if (!audio) return "00:00";
    const duration = audio.duration;
    if (isNaN(duration)) return "00:00";
    //   格式化时间
    return timeFormat(duration);
  };
  // 格式化时间
  const timeFormat = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  // 播放选中的歌曲
  const handlePlayMusic = (music: any) => {
    dispatch(setCurrentMusic(music));
    dispatch(setIsPlay(true));
  };

  return (
    <main className={styles.playlist} style={{ width: show ? "60%" : "0" }}>
      <div className={styles.header}>
        <h3>播放列表</h3>
        <span className={styles.count}>共{musicList.length}首</span>
      </div>
      <div className={styles.music_header}>
        <div className={styles.index}>序号</div>
        <div className={styles.info}>
          <div className={styles.name}>歌曲名</div>
          <div className={styles.artist}>歌手</div>
        </div>
        <div className={styles.duration}>时长</div>
      </div>
      <div className={styles.list_container}>
        {musicList.map((music: any, index: number) => (
          <div
            key={music.id}
            className={`${styles.music_item} ${
              currentMusic?.id === music.id ? styles.active : ""
            }`}
          >
            <div className={styles.index}>
              {currentMusic?.id === music.id && isPlay ? (
                <div className={styles.loader}>
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                  <span className={styles.bar}></span>
                </div>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{music.name}</div>
              <div className={styles.artist}>{music.singer}</div>
              <div className={styles.actions}>
                <svg
                  className={`icon ${styles.play_icon}`}
                  aria-hidden="true"
                  onClick={() => handlePlayMusic(music)}
                >
                  <use xlinkHref="#icon-icon_play"></use>
                </svg>
              </div>
            </div>
            <div className={styles.duration}>{getDuration(music.id)}</div>

            <audio src={music.songUrl} id={`music_${music.id}`}></audio>
          </div>
        ))}
      </div>
    </main>
  );
};
export default PlayList;
