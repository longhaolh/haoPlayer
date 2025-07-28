import { type FC, useEffect, useState, useRef, useCallback } from "react";
import styles from './style.module.scss';
import { useSelector, useDispatch } from "react-redux";
import { setCurrentTime, setIsPlay } from "@/store/modules/player";

interface LyricLine {
    time: number; // 时间（秒）
    text: string; // 歌词文本
}

const Lyric: FC<{ lyric: string, currentTime?: number }> = ({ lyric, currentTime = 0 }) => {
    const dispatch = useDispatch();
    const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
    const [isJumping, setIsJumping] = useState<boolean>(false);
    const lyricContainerRef = useRef<HTMLDivElement>(null);
    const { currentMusic, isPlay } = useSelector((state) => state.player);
    // 解析LRC格式歌词
    useEffect(() => {
        if (!lyric) return;
        const lines = lyric.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
        const parsedLines: LyricLine[] = [];
        
        lines.forEach(line => {
            // 跳过空行和不包含时间标签的行
            if (!line || !timeRegex.test(line)) return;
            
            // 重置正则表达式的lastIndex
            timeRegex.lastIndex = 0;
            
            // 提取所有时间标签
            const matches = [...line.matchAll(timeRegex)];
            if (matches.length === 0) return;
            
            // 提取歌词文本（去除时间标签）
            const text = line.replace(timeRegex, '').trim();
            if (!text) return; // 跳过没有文本的行
            
            // 为每个时间标签创建一个歌词行
            matches.forEach(match => {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = match[3].length === 2 
                    ? parseInt(match[3]) * 10 
                    : parseInt(match[3]);
                
                const time = minutes * 60 + seconds + milliseconds / 1000;
                parsedLines.push({ time, text });
            });
        });
        
        // 按时间排序
        parsedLines.sort((a, b) => a.time - b.time);
        console.log('parsedLines', parsedLines);
        setParsedLyrics(parsedLines);
    }, [lyric]);
    
    // 根据当前播放时间更新当前行
    useEffect(() => {
        if (parsedLyrics.length === 0) return;
        
        // 找到当前时间对应的歌词行
        let index = parsedLyrics.findIndex(line => line.time > currentTime);
        // 如果没找到（当前时间超过了最后一行歌词的时间），则显示最后一行
        if (index === -1) {
            index = parsedLyrics.length;
        }
        // 当前行是上一行（即时间小于等于当前时间的最后一行）
        const currentIndex = index > 0 ? index - 1 : 0;
        
        if (currentIndex !== currentLineIndex) {
            setCurrentLineIndex(currentIndex);
        }
    }, [currentTime, parsedLyrics, currentLineIndex]);
    
    // 滚动到当前行，确保当前行始终在中间
    const scrollToActiveLine = useCallback(() => {
        if (!lyricContainerRef.current || parsedLyrics.length === 0) return;
        
        const container = lyricContainerRef.current;
        const activeElement = container.querySelector(`.${styles.active}`);
        
        if (activeElement) {
            // 计算滚动位置：当前行位置 - 容器高度的一半 + 行高的一半
            const containerHeight = container.clientHeight;
            const activeElementHeight = (activeElement as HTMLElement).clientHeight;
            
            // 计算当前行到容器顶部的距离
            const activeElementTop = activeElement.getBoundingClientRect().top;
            const containerTop = container.getBoundingClientRect().top;
            const currentOffset = activeElementTop - containerTop;
            
            // 计算目标位置：使当前行位于容器中央
            const targetOffset = containerHeight / 2 - activeElementHeight / 2;
            const scrollTop = container.scrollTop + (currentOffset - targetOffset);
            
            // 平滑滚动到当前行
            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    }, [parsedLyrics, currentLineIndex]);
    
    // 当当前行索引变化时滚动
    useEffect(() => {
        scrollToActiveLine();
    }, [currentLineIndex]);
    
    // 当歌词解析完成或组件挂载后滚动
    useEffect(() => {
        if (parsedLyrics.length > 0) {
            // 使用setTimeout确保DOM已经更新
            setTimeout(scrollToActiveLine, 100);
        }
    }, [parsedLyrics]);
    /**
     * 点击歌词跳转到对应时间点
     * @param time 歌词时间点（秒）
     * @param index 歌词行索引
     */
    const handleClickLyric = (time: number, index: number) => {
        // 设置跳转状态，用于视觉反馈
        setIsJumping(true);
        
        // 设置临时点击状态，用于视觉反馈
        setCurrentLineIndex(index);
        
        // 设置新的播放时间点
        dispatch(setCurrentTime(time));
        
        // 直接修改音频元素的当前时间
        const audio = document.getElementById("audio") as HTMLAudioElement;
        if (audio) {
            audio.currentTime = time;
            audio.play();
            dispatch(setIsPlay(true));
        }
        
        // 重置跳转状态
        setTimeout(() => {
            setIsJumping(false);
        }, 300);
    }
    return (
      <div className={styles.lyric_container}>
        <section className={styles.song_info}>
          <img src={currentMusic.posterUrl} alt={currentMusic.name} />
          <div className={styles.lyric_title}>
            <p>
              歌曲名:<span>{currentMusic.name}</span>
            </p>
          </div>
          <div className={styles.lyric_artist}>
            <p>
              歌手:<span>{currentMusic.singer}</span>
            </p>
          </div>
        </section>
        <div className={styles.lyric_wrapper} ref={lyricContainerRef}>
          {parsedLyrics.length > 0 ? (
            <>
              {parsedLyrics.map((line, index) => (
                <div
                  key={`${line.time}-${index}`}
                  className={`${styles.lyric_line} ${
                    index === currentLineIndex ? styles.active : ""
                  } ${
                    isJumping && index === currentLineIndex
                      ? styles.jumping
                      : ""
                  }`}
                  onClick={() => {
                    handleClickLyric(line.time, index);
                  }}
                >
                  {line.text}
                </div>
              ))}
            </>
          ) : (
            <div className={styles.no_lyric}>暂无歌词</div>
          )}
        </div>
      </div>
    );
};

export default Lyric;