import { type FC, useEffect, useState, useRef, useCallback } from "react";
import styles from './style.module.scss';
import { useSelector, useDispatch } from "react-redux";
import { setCurrentTime, setIsPlay } from "@/store/modules/player";

interface LyricLine {
    time: number; // 时间（秒）
    text: string; // 歌词文本
}

// 音频可视化组件
const AudioVisualizer: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const randomDataRef = useRef<Uint8Array | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const isConnectedRef = useRef<boolean>(false);
    const { isPlay } = useSelector((state) => state.player);
    
    // 初始化音频可视化
    useEffect(() => {
        // 获取audio元素
        audioRef.current = document.getElementById("audio") as HTMLAudioElement;
        if (!audioRef.current) {
            console.error("Audio element not found");
            return;
        }
        
        // 设置canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 创建随机数据数组用于视觉效果
        if (!randomDataRef.current) {
            randomDataRef.current = Uint8Array.from(new Uint8Array(120), (v, k) => k);
            // 打乱数组顺序
            randomDataRef.current.sort(() => Math.random() - 0.5);
        }
        
        // 创建音频上下文和分析器
        const initAudioContext = () => {
            try {
                // 如果已经创建了AudioContext，则不再创建
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                
                if (!analyserRef.current) {
                    analyserRef.current = audioContextRef.current.createAnalyser();
                    analyserRef.current.fftSize = 512;
                    const bufferLength = analyserRef.current.frequencyBinCount;
                    dataArrayRef.current = new Uint8Array(bufferLength);
                }
                
                // 只有在第一次初始化时创建source并连接
                if (!isConnectedRef.current && audioRef.current) {
                    try {
                        // 断开之前的连接（如果有）
                        if (sourceRef.current) {
                            sourceRef.current.disconnect();
                        }
                        
                        // 创建新的source并连接
                        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                        sourceRef.current.connect(analyserRef.current);
                        analyserRef.current.connect(audioContextRef.current.destination);
                        isConnectedRef.current = true;
                        console.log("Audio context connected successfully");
                    } catch (error) {
                        console.error("Error connecting audio context:", error);
                    }
                }
                
                // 开始动画
                if (isPlay) {
                    startAnimation();
                }
            } catch (error) {
                console.error("Error initializing audio context:", error);
            }
        };
        
        // 检查音频元素是否已加载
        if (audioRef.current.readyState > 0) {
            initAudioContext();
        } else {
            audioRef.current.addEventListener('loadedmetadata', initAudioContext, { once: true });
        }
        
        // 添加canplay事件监听器，确保在音频可以播放时初始化AudioContext
        const handleCanPlay = () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            initAudioContext();
        };
        
        audioRef.current.addEventListener('canplay', handleCanPlay);
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // 移除事件监听器
            if (audioRef.current) {
                audioRef.current.removeEventListener('loadedmetadata', initAudioContext);
                audioRef.current.removeEventListener('canplay', handleCanPlay);
            }
        };
    }, [isPlay]);
    
    // 动画函数
    const startAnimation = () => {
        if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current || !randomDataRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const renderFrame = () => {
            animationRef.current = requestAnimationFrame(renderFrame);
            
            // 获取频率数据
            analyserRef.current!.getByteFrequencyData(dataArrayRef.current!);
            
            // 处理数据
            const bData: number[] = [];
            randomDataRef.current!.forEach((value) => {
                bData.push(dataArrayRef.current![value]);
            });
            
            // 绘制音频可视化效果
            const angle = (Math.PI * 2) / bData.length;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#F35D26'; // 使用主题色
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            
            bData.forEach((value, index) => {
                ctx.save();
                ctx.rotate(angle * index);
                ctx.beginPath();
                const h = (value / 256) * 30; // 调整条形高度
                
                // 检查是否支持roundRect方法
                if (ctx.roundRect) {
                    ctx.roundRect(-2, 70, 2, h < 2 ? 2 : h, 2); // 调整大小和位置
                } else {
                    // 兼容性处理：手动绘制圆角矩形
                    const x = -2;
                    const y = 70;
                    const width = 2;
                    const height = h < 2 ? 2 : h;
                    const radius = 2;
                    
                    // 绘制圆角矩形的路径
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + width - radius, y);
                    ctx.arcTo(x + width, y, x + width, y + radius, radius);
                    ctx.lineTo(x + width, y + height - radius);
                    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
                    ctx.lineTo(x + radius, y + height);
                    ctx.arcTo(x, y + height, x, y + height - radius, radius);
                    ctx.lineTo(x, y + radius);
                    ctx.arcTo(x, y, x + radius, y, radius);
                }
                
                ctx.fill();
                ctx.restore();
            });
            
            ctx.restore();
        };
        
        renderFrame();
    };
    
    // 监听播放状态变化
    useEffect(() => {
        if (isPlay) {
            // 如果已经初始化了AudioContext，则开始动画
            if (audioContextRef.current && analyserRef.current && dataArrayRef.current && randomDataRef.current) {
                startAnimation();
            }
        } else {
            // 如果暂停，则取消动画
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
    }, [isPlay]);
    
    return <canvas ref={canvasRef} className={styles.audio_visualizer} />;
};

const Lyric: FC<{ lyric: string, currentTime?: number }> = ({ lyric, currentTime = 0 }) => {
    const dispatch = useDispatch();
    const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
    const [isJumping, setIsJumping] = useState<boolean>(false);
    const lyricContainerRef = useRef<HTMLDivElement>(null);
    const { currentMusic } = useSelector((state) => state.player);
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
          <div className={styles.poster_container}>
            <img src={currentMusic.posterUrl} alt={currentMusic.name} />
            <AudioVisualizer />
          </div>
          <div className={styles.lyric_title}>
            <p>
              歌曲名:<span>{currentMusic.name}</span>
            </p>
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