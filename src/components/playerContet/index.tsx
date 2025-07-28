import { type FC } from 'react'
import styles from './style.module.scss'
import Lyric from '@/components/Lyric'
import { useSelector } from 'react-redux';
import PlayList from "../playList";
const PlayerContet: FC = () => {
  const { currentMusic, currentTime } = useSelector((state) => state.player);
  return (
    <div className={styles.playercontet_container}>
      <Lyric lyric={currentMusic.lyric} currentTime={currentTime} />
      <PlayList />
    </div>
  );
};
export default PlayerContet;
