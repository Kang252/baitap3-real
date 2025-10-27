// frontend/src/context/AudioContext.js
import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { Audio } from 'expo-av';
import { getMockSongs } from '../data/songs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadContext, DOWNLOAD_STATUS } from './DownloadContext';
// --- BỔ SUNG FR-8.3 ---
import { HistoryContext } from './HistoryContext'; // Import HistoryContext
// --- KẾT THÚC BỔ SUNG ---

export const AudioContext = createContext();

const SONG_LIST = getMockSongs();

export const AudioProvider = ({ children }) => {
    // (Các state giữ nguyên)
    const [sound, setSound] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [currentQueue, setCurrentQueue] = useState(SONG_LIST);
    const [originalQueue, setOriginalQueue] = useState(SONG_LIST);
    const [isLoading, setIsLoading] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');
    const [sleepTimerId, setSleepTimerId] = useState(null);
    const [volume, setVolume] = useState(1.0);

    const { downloads } = useContext(DownloadContext);
    // --- BỔ SUNG FR-8.3 ---
    const { addSongToHistory } = useContext(HistoryContext); // Lấy hàm từ HistoryContext
    // --- KẾT THÚC BỔ SUNG ---

    const isPlayerLoading = useRef(false);

    // (useEffect load/save state và setAudioModeAsync giữ nguyên)
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            interruptionModeIOS: 1,
            interruptionModeAndroid: 1,
        });
        
        const loadInitialState = async () => {
             try {
                const savedVolume = await AsyncStorage.getItem('appVolume');
                if (savedVolume !== null) {
                    setVolume(parseFloat(savedVolume));
                }
            } catch (e) { console.error("Lỗi tải trạng thái:", e); }
        };
        loadInitialState();

        return () => { sound?.unloadAsync(); };
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('appVolume', String(volume));
    }, [volume]);


    // Hàm phát nhạc chính
    const playSong = async (song, queue = null) => {
        if (isPlayerLoading.current) return;
        // Kiểm tra nếu bài hát là null/undefined
        if (!song || !song.id) {
            console.warn("playSong được gọi với song không hợp lệ.");
            return;
        }

        if (song?.id === currentSong?.id && sound) {
            handlePlayPause();
            return;
        }

        isPlayerLoading.current = true;
        setIsLoading(true);
        console.log("Đang tải bài hát:", song.title);

        try {
            if (sound) {
                await sound.unloadAsync();
            }

            // (Logic kiểm tra file offline giữ nguyên)
            let source;
            const downloadedFile = downloads[song.id]; 
            if (downloadedFile && downloadedFile.status === DOWNLOAD_STATUS.DOWNLOADED && downloadedFile.localUri) {
                console.log(`Phát từ file offline: ${downloadedFile.localUri}`);
                source = { uri: downloadedFile.localUri };
            } else {
                source = typeof song.trackUrl === 'string' ? { uri: song.trackUrl } : song.trackUrl;
            }
            
            if (!source) {
                 throw new Error("Nguồn nhạc không hợp lệ (trackUrl bị thiếu hoặc tệp tải lỗi).");
            }

            const { sound: newSound, status } = await Audio.Sound.createAsync(
                source,
                { 
                    shouldPlay: true, 
                    progressUpdateIntervalMillis: 500,
                    volume: volume, 
                }
            );

            setSound(newSound);
            setCurrentSong(song);
            setIsPlaying(true);
            setPlaybackStatus(status);
            newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

            // --- BỔ SUNG FR-8.3 ---
            // Thêm vào lịch sử sau khi phát thành công
            addSongToHistory(song);
            // --- KẾT THÚC BỔ SUNG ---

            // (Logic xử lý queue giữ nguyên)
            if (queue) {
                setOriginalQueue(queue); 
                 if (isShuffle) {
                    const shuffled = [...queue].sort(() => Math.random() - 0.5);
                    const currentSongIndex = shuffled.findIndex(s => s.id === song.id);
                    if (currentSongIndex > -1) {
                        const [current] = shuffled.splice(currentSongIndex, 1);
                        shuffled.unshift(current);
                    }
                    setCurrentQueue(shuffled);
                 } else {
                     setCurrentQueue(queue);
                 }
            }

        } catch (error) {
            console.error("Lỗi khi tải bài hát:", error);
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
            isPlayerLoading.current = false;
        }
    };
    
    // (Các hàm còn lại: onPlaybackStatusUpdate, handleSongEnd, handlePlayPause, seekTo, formatTime, playNext, playPrevious, toggles, timers, setSongVolume... giữ nguyên)
    
    const onPlaybackStatusUpdate = (status) => {
        setPlaybackStatus(status);
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish && !status.isLooping) {
                handleSongEnd();
            }
        } else {
            if (status.error) {
                console.error(`Lỗi phát nhạc: ${status.error}`);
                setIsPlaying(false);
            }
        }
    };

    const handleSongEnd = () => {
        console.log("Bài hát kết thúc, repeatMode:", repeatMode);
        if (repeatMode === 'one') {
            sound?.replayAsync(); 
        } else {
            playNext(repeatMode === 'all'); 
        }
    };

     const handlePlayPause = async () => {
        if (isLoading) return;
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        } else if (currentSong) {
            playSong(currentSong); 
        }
    };

     const seekTo = async (position) => {
        if (sound) {
            try {
                await sound.setPositionAsync(position);
            } catch (e) {
                console.error("Lỗi khi tua:", e);
            }
        }
    };

    const formatTime = (millis) => {
        if (!millis || millis < 0) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

     const playNext = (isRepeatAll = false) => {
         if (!currentSong || currentQueue.length === 0) return;
        let currentIndex = currentQueue.findIndex(s => s.id === currentSong.id);
        if (currentIndex === -1) { currentIndex = 0; }
        let nextIndex;
        if (isShuffle && !isRepeatAll) {
             nextIndex = Math.floor(Math.random() * currentQueue.length);
             if (currentQueue.length > 1 && nextIndex === currentIndex) {
                 nextIndex = (currentIndex + 1) % currentQueue.length;
             }
        } else {
            nextIndex = (currentIndex + 1) % currentQueue.length;
        }
        if (!isRepeatAll && !isShuffle && nextIndex === 0 && currentIndex === currentQueue.length - 1) {
             console.log("Hết danh sách, dừng phát.");
             sound?.pauseAsync();
             setIsPlaying(false);
             sound?.setPositionAsync(0);
             return;
        }
        if (currentQueue[nextIndex]) {
            playSong(currentQueue[nextIndex]);
        }
    };

    const playPrevious = () => {
         if (!currentSong || currentQueue.length === 0) return;
        let currentIndex = currentQueue.findIndex(s => s.id === currentSong.id);
         if (currentIndex === -1) currentIndex = 0;
        let prevIndex;
        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * currentQueue.length);
             if (currentQueue.length > 1 && prevIndex === currentIndex) {
                 prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
             }
        } else {
            prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
        }
        if (currentQueue[prevIndex]) {
            playSong(currentQueue[prevIndex]);
        }
    };

    const toggleShuffle = () => {
        const newShuffleState = !isShuffle;
        setIsShuffle(newShuffleState);
        if (newShuffleState) {
            const shuffled = [...originalQueue].sort(() => Math.random() - 0.5);
            const currentSongIndex = shuffled.findIndex(s => s.id === currentSong?.id);
            if (currentSongIndex > -1) {
                const [current] = shuffled.splice(currentSongIndex, 1);
                shuffled.unshift(current);
            }
            setCurrentQueue(shuffled);
        } else {
            const currentIndexInOriginal = originalQueue.findIndex(s => s.id === currentSong?.id);
            if (currentIndexInOriginal > -1) {
                 const reordered = [
                     ...originalQueue.slice(currentIndexInOriginal),
                     ...originalQueue.slice(0, currentIndexInOriginal)
                 ];
                 setCurrentQueue(reordered);
            } else {
                 setCurrentQueue(originalQueue);
            }
        }
    };

    const toggleRepeatMode = () => {
        if (repeatMode === 'off') setRepeatMode('all');
        else if (repeatMode === 'all') setRepeatMode('one');
        else setRepeatMode('off');
    };

    const setSleepTimer = (duration) => {
        clearSleepTimer();
        console.log(`Hẹn giờ tắt nhạc trong ${duration} ms`);
        const timerId = setTimeout(() => {
            if (sound && isPlaying) {
                sound.pauseAsync();
                setIsPlaying(false);
            }
            setSleepTimerId(null);
             console.log("Đã tắt nhạc theo hẹn giờ.");
        }, duration);
        setSleepTimerId(timerId);
    };

    const clearSleepTimer = () => {
        if (sleepTimerId) {
            clearTimeout(sleepTimerId);
            setSleepTimerId(null);
            console.log("Đã hủy hẹn giờ.");
        }
    };

    const setSongVolume = async (newVolume) => {
        setVolume(newVolume); 
        if (sound) {
            try {
                await sound.setVolumeAsync(newVolume);
            } catch (e) {
                console.error("Lỗi khi chỉnh âm lượng:", e);
            }
        }
    };

    // Giá trị cung cấp cho Context
    const value = {
        sound,
        currentSong,
        isPlaying,
        playbackStatus,
        currentQueue,
        isLoading,
        isShuffle,
        repeatMode,
        sleepTimerId,
        positionMillis: playbackStatus?.positionMillis || 0,
        durationMillis: playbackStatus?.durationMillis || 0,
        volume,
        playSong,
        handlePlayPause,
        seekTo,
        playNext,
        playPrevious,
        formatTime,
        toggleShuffle,
        toggleRepeatMode,
        setSleepTimer,
        clearSleepTimer,
        setSongVolume,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};