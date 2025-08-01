import { type FC, useState, useEffect, useRef } from "react";
import styles from "./style.module.scss";
import { useSelector, useDispatch } from "react-redux";
import "@/assets/iconfonts/iconfont.js";
import {
  setIsPlay,
  setCurrentMusic,
  setVolume,
  setDuration,
  setCurrentTime,
  setPlayMode,
  setShow,
} from "@/store/modules/player";
const PlayerFoot: FC = () => {
  const dispatch = useDispatch();

  // 定义DOM引用
  const playLineRef = useRef<HTMLDivElement>(null);
  const volumnLineRef = useRef<HTMLDivElement>(null);
  const [mute, setMute] = useState(false);

  const {
    isPlay,
    currentMusic,
    musicList,
    volume,
    currentTime,
    duration,
    playMode,
    show,
  } = useSelector((state) => state.player);

  const timeFormat = (time: number) => {
    return `${
      Math.floor(time / 60) < 10
        ? "0" + Math.floor(time / 60)
        : Math.floor(time / 60)
    }:${
      Math.floor(time % 60) < 10
        ? "0" + Math.floor(time % 60)
        : Math.floor(time % 60)
    }`;
  };

  //   初始化播放器
  useEffect(() => {
    const audio = document.getElementById("audio") as HTMLAudioElement;
    dispatch(setShow(false));
    const handleMetadata = () => {
      dispatch(setDuration(audio.duration));
    };
    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));
    };

    const handleEnded = () => {
      dispatch(setIsPlay(false));
      if (musicList.length > 0) {
        handelChangeMusic("next");
      }
    };

    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    // 组件卸载时清理事件监听
    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [dispatch, musicList]);

  // 监听currentMusic变化，更新音频源
  useEffect(() => {
    if (currentMusic && currentMusic.songUrl) {
      const audio = document.getElementById("audio") as HTMLAudioElement;

      // 更准确地比较URL，避免因为协议或其他差异导致的误判
      const currentSrc = audio.src;
      const newSrc = currentMusic.songUrl;
      const normalizeUrl = (url: string) =>
        url.replace(/^https?:\/\//, "").replace(/\/$/, "");

      // 只有当音频源真正改变时才更新
      if (!currentSrc || normalizeUrl(currentSrc) !== normalizeUrl(newSrc)) {
        audio.src = currentMusic.songUrl;

        // 如果当前是播放状态，则自动播放新歌曲
        if (isPlay) {
          // 等待音频加载完成后播放
          const handleCanPlay = () => {
            audio.play().catch((err) => {
              console.error("切换歌曲后自动播放失败:", err);
              dispatch(setIsPlay(false));
            });
            audio.removeEventListener("canplay", handleCanPlay);
          };

          audio.addEventListener("canplay", handleCanPlay);
        }
      }
    }
  }, [currentMusic?.id, dispatch]);

  // 音量控制
  useEffect(() => {
    const audio = document.getElementById("audio") as HTMLAudioElement;
    audio.volume = volume;
  }, [volume]);
  /**
   * 播放/暂停控制
   */
  const handelPlay = () => {
    const audio = document.getElementById("audio") as HTMLAudioElement;
    if (isPlay) {
      audio.pause();
    } else {
      audio.currentTime = currentTime;
      audio.play();
    }
    dispatch(setIsPlay(!isPlay));
  };
  /**
   * 切换歌曲
   */
  const handelChangeMusic = (type: string) => {
    let current = {};
    const mode = playMode; // 使用正确的变量名
    // 上一首
    if (type === "prev") {
      if (mode === "single") {
        // 单曲循环
        current = currentMusic;
      } else if (mode === "random") {
        // 随机播放
        //   @ts-expect-error 忽略ts错误
        const arr = musicList.filter((item) => item.id !== currentMusic.id);
        current = arr[Math.floor(Math.random() * arr.length)];
      } else {
        // 普通模式 顺序播放
        const index = musicList.findIndex(
          //   @ts-expect-error 忽略ts错误
          (item) => item.id === currentMusic.id
        );
        if (index === 0) {
          current = musicList[musicList.length - 1];
        } else {
          current = musicList[index - 1];
        }
      }
    } else {
      // 下一首
      if (mode === "single") {
        current = currentMusic;
      } else if (mode === "random") {
        // 随机播放
        //   @ts-expect-error 忽略ts错误
        const arr = musicList.filter((item) => item.id !== currentMusic.id);
        current = arr[Math.floor(Math.random() * arr.length)];
      } else {
        // 普通模式 顺序播放
        const index = musicList.findIndex(
          //   @ts-expect-error 忽略ts错误
          (item) => item.id === currentMusic.id
        );
        if (index === musicList.length - 1) {
          current = musicList[0];
        } else {
          current = musicList[index + 1];
        }
      }
    }

    // 先更新Redux状态
    dispatch(setCurrentMusic(current));
    dispatch(setIsPlay(true));

    // 然后更新音频元素
    const audio = document.getElementById("audio") as HTMLAudioElement;
    // @ts-expect-error 忽略ts错误
    audio.src = current.songUrl;

    // 移除之前可能存在的事件监听器，避免重复
    const playOnceLoaded = () => {
      audio.play().catch((err) => {
        console.error("切换歌曲播放失败:", err);
        dispatch(setIsPlay(false));
      });
      audio.removeEventListener("loadedmetadata", playOnceLoaded);
    };

    // 添加新的事件监听器
    audio.addEventListener("loadedmetadata", playOnceLoaded);
  };
  /**
   * 调整音量
   */
  const handleVolume = (volumeNum: number, mute?: boolean) => {
    const audio = document.getElementById("audio") as HTMLAudioElement;

    // 直接设置音量，不保存和恢复播放进度
    if (mute) {
      setMute(true);
      audio.volume = 0;
    } else {
      setMute(false);
      audio.volume = volumeNum;
      dispatch(setVolume(volumeNum));
    }
  };
  /**
   * 音量条点击事件
   */
  const handleVolumeNum = (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发其他点击事件
    e.stopPropagation();
    e.preventDefault();

    // 确保volumnLineRef.current不为null
    if (!volumnLineRef.current) return;

    const clientX = e.nativeEvent.offsetX;
    const clientWidth = volumnLineRef.current.clientWidth;

    // 确保音量值在0-1之间
    let volumeNum = clientX / clientWidth;
    volumeNum = Math.max(0, Math.min(1, volumeNum));

    // 调整音量
    handleVolume(volumeNum);
  };
  /**
   * 点击进度条
   */
  const handleProgress = (e: React.MouseEvent) => {
    // 阻止事件冒泡和默认行为
    e.stopPropagation();
    e.preventDefault();

    // 确保playLineRef.current不为null
    if (!playLineRef.current) return;

    // 获取点击位置相对于进度条的偏移量
    const rect = playLineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const clientWidth = playLineRef.current.clientWidth;

    // 计算进度比例（确保在0-1之间）
    const progressNum = Math.max(0, Math.min(1, offsetX / clientWidth));

    // 更新Redux状态和音频元素
    dispatch(setCurrentTime(progressNum * duration));
    const audio = document.getElementById("audio") as HTMLAudioElement;

    // 保存当前音量和播放状态
    const currentVolume = audio.volume;
    const wasPlaying = isPlay && !audio.paused;

    // 设置新的播放位置
    audio.currentTime = progressNum * duration;

    // 确保音量不变
    audio.volume = currentVolume;

    // 如果之前是播放状态，确保继续播放
    if (wasPlaying) {
      audio.play().catch((err) => {
        console.error("恢复播放失败:", err);
      });
    }
  };
  return (
    <main className={styles.playerfoot_container}>
      <section className={styles.foot_left}>
        <svg
          className="icon"
          aria-hidden="true"
          onClick={() => {
            handelChangeMusic("prev");
          }}
        >
          <use xlinkHref="#icon-prev"></use>
        </svg>
        {isPlay ? (
          <svg className="icon" aria-hidden="true" onClick={handelPlay}>
            <use xlinkHref="#icon-pause"></use>
          </svg>
        ) : (
          <svg
            className="icon"
            style={{ width: "38px", height: "38px" }}
            aria-hidden="true"
            onClick={handelPlay}
          >
            <use xlinkHref="#icon-icon_play"></use>
          </svg>
        )}
        <svg
          className="icon"
          aria-hidden="true"
          onClick={() => {
            handelChangeMusic("next");
          }}
        >
          <use xlinkHref="#icon-next"></use>
        </svg>
      </section>
      <span className={styles.curTime}>{timeFormat(currentTime)}</span>
      <section
        className={styles.foot_center}
        ref={playLineRef}
        onClick={handleProgress}
      >
        <div className={styles.play_line}>
          <div
            className={styles.play_line_progress}
            style={{ width: `${(currentTime / duration) * 100}%` }}
            onClick={(e) => {
              // 阻止冒泡，确保父元素的onClick能正确处理
              e.stopPropagation();
              handleProgress(e);
            }}
          ></div>
          <span
            className={styles.play_line_dot}
            style={{ left: `${(currentTime / duration) * 100}%` }}
          ></span>
        </div>
      </section>
      <span className={styles.duration}>{timeFormat(duration)}</span>
      <section className={styles.foot_right}>
        {playMode === "normal" ? (
          <svg
            className="icon"
            aria-hidden="true"
            onClick={() => dispatch(setPlayMode("single"))}
          >
            <use xlinkHref="#icon-normal-play"></use>
          </svg>
        ) : playMode === "single" ? (
          <svg
            className="icon"
            aria-hidden="true"
            onClick={() => dispatch(setPlayMode("random"))}
          >
            <use xlinkHref="#icon-single"></use>
          </svg>
        ) : (
          <svg
            className="icon"
            aria-hidden="true"
            onClick={() => dispatch(setPlayMode("normal"))}
          >
            <use xlinkHref="#icon-random"></use>
          </svg>
        )}
        <svg
          className="icon"
          aria-hidden="true"
          style={{ width: "34px", height: "25px" }}
          onClick={() => dispatch(setShow(!show))}
        >
          <use xlinkHref="#icon-list"></use>
        </svg>
        {mute ? (
          <svg
            className="icon"
            aria-hidden="true"
            onClick={() => {
              handleVolume(volume);
            }}
          >
            <use xlinkHref="#icon-mute"></use>
          </svg>
        ) : (
          <svg
            className="icon"
            aria-hidden="true"
            onClick={() => {
              handleVolume(0, true);
            }}
          >
            <use xlinkHref="#icon-volume"></use>
          </svg>
        )}
        <div
          className={styles.volumn}
          ref={volumnLineRef}
          onClick={(e) => {
            handleVolumeNum(e);
          }}
        >
          <div className={styles.volumn_line}>
            <div
              className={styles.volumn_line_progress}
              style={{ width: `${mute ? 0 : volume * 100}%` }}
              onClick={(e) => {
                // 阻止冒泡，确保父元素的onClick能正确处理
                e.stopPropagation();
                handleVolumeNum(e);
              }}
            ></div>
            <div
              className={styles.volumn_line_dot}
              style={{ left: `${mute ? 0 : volume * 100}%` }}
            ></div>
          </div>
        </div>
      </section>
      <audio id="audio" preload="auto"></audio>
    </main>
  );
};
export default PlayerFoot;
