import { type FC } from "react";
import styles from "./style.module.scss";
import logo from "@/assets/images/logo.png";
import PlayerContet from "@/components/playerContet";
import PlayerFoot from "@/components/playerFoot";
import logoText from "@/assets/images/logoText.png";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMusicList } from "@/store/modules/player";

const Home: FC = () => {
  const dispatch = useDispatch();
  // @ts-expect-error 忽略ts错误
  const currentMusic = useSelector((state) => state.player.currentMusic);
  // @ts-expect-error 忽略ts错误
  const musicList = useSelector((state) => state.player.musicList);
  
  useEffect(() => {
    // 检查是否有持久化的音乐列表数据
    if (!musicList || musicList.length === 0) {
      console.log('没有持久化的音乐列表数据，正在获取新数据...');
      // @ts-expect-error 忽略ts错误
      dispatch(getMusicList());
    } else {
      console.log('从持久化存储恢复音乐列表数据:', musicList.length, '首歌曲');
      // 确保有当前音乐
      if (!currentMusic || !currentMusic.id) {
        console.log("没有当前播放的音乐，设置第一首歌曲为当前音乐");
        // @ts-expect-error 忽略ts错误
        dispatch(getMusicList());
      } else {
        console.log('从持久化存储恢复当前播放的音乐:', currentMusic.name);
      }
    }
  }, [dispatch, musicList, currentMusic]);
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.header_left}>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
            <img src={logoText} alt="logoText" title="只听好音乐" />
          </div>
        </div>
      </header>
      <section className={styles.content}>
        <PlayerContet />
      </section>
      <footer className={styles.footer}>
        <PlayerFoot />
      </footer>
      <div className={styles.back}>
        {currentMusic?.posterUrl && (
          <img src={currentMusic?.posterUrl} alt="poster" />
        )}
        <div className={styles.mask}></div>
      </div>
    </div>
  );
};
export default Home;
