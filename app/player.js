// frontend/app/player.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '../src/hooks/useAudioPlayer'; // Đảm bảo đường dẫn đúng
import { useFavorites } from '../src/context/FavoritesContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AddToPlaylistModal from '../src/components/AddToPlaylistModal';
import * as Sharing from 'expo-sharing'; // Import Sharing

// --- Logic phân tích Lời bài hát (LRC) ---
const parseLRC = (lrcString) => {
  if (!lrcString) return [];
  const lines = lrcString.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/; // Hỗ trợ 2 hoặc 3 chữ số ms

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      // Đảm bảo milliseconds luôn là 3 chữ số
      const millisecondsStr = match[3].padEnd(3, '0');
      const milliseconds = parseInt(millisecondsStr, 10);

      const time = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        parsed.push({ time, text });
      }
    }
  }
  return parsed.sort((a, b) => a.time - b.time); // Đảm bảo lời được sắp xếp
};
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// --- Kết thúc Logic Lời bài hát ---


export default function PlayerScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lấy các state và hàm từ Audio Context
  const {
    currentSong, isPlaying, positionMillis, durationMillis,
    handlePlayPause, seekTo, playNext, playPrevious, formatTime,
    repeatMode, isShuffle, toggleRepeatMode, toggleShuffle,
    sleepTimerId, setSleepTimer, clearSleepTimer,
    isLoading,
    volume, setSongVolume, // Lấy volume và hàm set
  } = useAudioPlayer();

  // Lấy các hàm và state từ Favorites Context
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavorites();

  // State cục bộ cho thanh trượt tiến trình
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);

  // State và Ref cho Lời bài hát
  const flatListRef = useRef(null);
  const lyricsLines = useMemo(() => {
    return parseLRC(currentSong?.lyrics);
  }, [currentSong?.lyrics]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  // Effect cập nhật vị trí thanh trượt và dòng lyric hiện tại
  useEffect(() => {
    if (!isSeeking) {
      setSliderPosition(positionMillis);
    }
    if (lyricsLines.length === 0) return;
    let newIndex = -1;
    for (let i = lyricsLines.length - 1; i >= 0; i--) {
      if (positionMillis >= lyricsLines[i].time) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [positionMillis, lyricsLines, currentLineIndex, isSeeking]);

  // Effect cuộn lời bài hát đến dòng hiện tại
  useEffect(() => {
    if (flatListRef.current && currentLineIndex !== -1 && lyricsLines.length > 0 && !isSeeking) {
      flatListRef.current.scrollToIndex({
        index: currentLineIndex,
        animated: true,
        viewPosition: 0.5, // Căn giữa dòng active
        viewOffset: -SCREEN_HEIGHT * 0.1 // Điều chỉnh offset nếu cần
      });
    }
  }, [currentLineIndex, lyricsLines, isSeeking]);

  // --- Render logic (Loading / Chưa có bài hát) ---
  if (isLoading && !currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
             <Ionicons name="chevron-down" size={28} color="white" />
          </Pressable>
        </View>
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </SafeAreaView>
    );
  }
  if (!currentSong) {
      return (
          <SafeAreaView style={styles.container}>
              <View style={styles.header}>
                  <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                      <Ionicons name="chevron-down" size={28} color="white" />
                  </Pressable>
              </View>
              <View style={[styles.content, styles.centerContent]}>
                  <Text style={styles.title}>Chưa chọn bài hát</Text>
              </View>
          </SafeAreaView>
      );
  }

  // Xử lý nguồn ảnh (require vs uri)
  const imageSource = (typeof currentSong.imageUrl === 'string')
    ? { uri: currentSong.imageUrl }
    : currentSong.imageUrl;

  // --- Event Handlers ---
  const songIsFavorited = useMemo(() => {
      // Dùng isFavorite từ context để kiểm tra
      return currentSong ? isFavorite(currentSong.id) : false;
  }, [currentSong, favorites, isFavorite]); // Phụ thuộc vào favorites từ context

  const handleToggleFavorite = () => {
    if (!currentSong) return;
    if (songIsFavorited) {
      removeFavorite(currentSong.id);
    } else {
      addFavorite(currentSong); // Truyền đối tượng song
    }
  };

  const showSleepTimerOptions = () => {
    Alert.alert(
      "Hẹn giờ tắt nhạc",
      sleepTimerId ? `Đang hẹn giờ. Bạn muốn tắt?` : "Chọn thời gian hẹn giờ:",
      sleepTimerId
      ? [ { text: "Hủy", style: "cancel" }, { text: "Tắt hẹn giờ", onPress: clearSleepTimer, style: "destructive" } ]
      : [
          { text: "15 phút", onPress: () => setSleepTimer(15 * 60 * 1000) },
          { text: "30 phút", onPress: () => setSleepTimer(30 * 60 * 1000) },
          { text: "1 giờ", onPress: () => setSleepTimer(60 * 60 * 1000) },
          { text: "Hủy", style: "cancel" },
        ]
    );
  };

  // Xử lý sự kiện Slider tiến trình
  const onSeekStart = () => { setIsSeeking(true); };
  const onSeekChange = (value) => { setSliderPosition(value); };
  const onSeekComplete = (value) => { seekTo(value); setIsSeeking(false); };

  // Xử lý lỗi cuộn FlatList
  const handleScrollToIndexFailed = (info) => {
    console.warn('Scroll to index failed:', info);
    setTimeout(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: info.index, animated: false, viewPosition: 0.5, viewOffset: -SCREEN_HEIGHT * 0.1 });
        }
    }, 100);
  };

  const handleShare = async () => {
    if (!currentSong) return;
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Lỗi", "Chia sẻ không khả dụng trên thiết bị này.");
      return;
    }
    try {
      const message = `Nghe bài hát "${currentSong.title}" của ${currentSong.artist}!`;
      // Thử gọi shareAsync với tùy chọn mimeType rõ ràng
      await Sharing.shareAsync(message, {
        mimeType: 'text/plain', // Chỉ định rõ là text
        dialogTitle: 'Chia sẻ bài hát' // Tiêu đề hộp thoại (Android)
      });
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
      if (error.code !== 'ERR_SHARING_CANCELLED') {
         Alert.alert("Lỗi", "Không thể chia sẻ bài hát.");
      }
    }
  };

  // --- List Header Component (UI phía trên Lyrics) ---
  const renderListHeader = () => (
    <View style={styles.content}>

      {/* Header (Back, Share, Hẹn giờ) */}
      <View style={styles.header}>
         <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}><Ionicons name="chevron-down" size={28} color="white" /></Pressable>
         <View style={{ flex: 1 }} />
         <Pressable onPress={handleShare} style={styles.iconButton}><Ionicons name="share-outline" size={24} color="white" /></Pressable>
         <Pressable onPress={showSleepTimerOptions} style={styles.iconButton}><Ionicons name="moon-outline" size={24} color={sleepTimerId ? "#1DB954" : "white"} /></Pressable>
      </View>

      {/* Ảnh bìa */}
      <Image source={imageSource} style={styles.image} defaultSource={require('../assets/images/default-album-art.png')} />

      {/* Thông tin (Add playlist, Tên, Favorite) */}
      <View style={styles.infoContainer}>
         <Pressable onPress={() => setIsModalVisible(true)} style={styles.iconButton}><Ionicons name="add-circle-outline" size={28} color={"gray"} /></Pressable>
         <View style={styles.infoText}>
             <Text style={styles.title} numberOfLines={1}>{currentSong.title || ''}</Text>
             <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || ''}</Text>
         </View>
         <Pressable onPress={handleToggleFavorite} style={styles.iconButton}>
            <Ionicons name={songIsFavorited ? "heart" : "heart-outline"} size={28} color={songIsFavorited ? "#1DB954" : "gray"} />
         </Pressable>
      </View>

      {/* Thanh Progress Slider (FR-2.3) */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationMillis || 1}
          value={sliderPosition}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#535353"
          thumbTintColor="#FFFFFF"
          onSlidingStart={onSeekStart}
          onValueChange={onSeekChange}
          onSlidingComplete={onSeekComplete}
          disabled={durationMillis === 0 || isLoading}
        />
        <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(isSeeking ? sliderPosition : positionMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      {/* Các nút điều khiển (Controls) */}
      <View style={styles.controlsContainer}>
         <Pressable onPress={toggleShuffle} style={styles.iconButton}><Ionicons name="shuffle" size={28} color={isShuffle ? "#1DB954" : "gray"} /></Pressable>
         <Pressable onPress={playPrevious} style={styles.iconButton}><Ionicons name="play-skip-back" size={32} color="white" /></Pressable>
         <Pressable onPress={handlePlayPause} style={styles.playButton} disabled={isLoading}>
            {isLoading ? (<ActivityIndicator size={70} color="#FFFFFF" />) : (<Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={70} color="white" />)}
         </Pressable>
         <Pressable onPress={playNext} style={styles.iconButton}><Ionicons name="play-skip-forward" size={32} color="white" /></Pressable>
         <Pressable onPress={toggleRepeatMode} style={styles.iconButton}><MaterialIcons name={repeatMode === 'one' ? 'repeat-one' : 'repeat'} size={28} color={repeatMode !== 'off' ? "#1DB954" : "gray"} /></Pressable>
      </View>

      {/* Thanh trượt âm lượng (FR-7.3) */}
      <View style={styles.volumeContainer}>
          <Ionicons name="volume-mute" size={20} color="gray" />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#535353"
            thumbTintColor="#FFFFFF"
            onValueChange={setSongVolume} // Cập nhật ngay khi kéo
          />
          <Ionicons name="volume-high" size={20} color="gray" />
      </View>

    </View>
  );

  // --- Main Render (FlatList - Lyrics) ---
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        ref={flatListRef}
        style={styles.container}
        data={lyricsLines}
        ListHeaderComponent={renderListHeader} // Hiển thị UI Player ở trên
        renderItem={({ item, index }) => { // Render từng dòng lyric
          const isActive = (index === currentLineIndex);
          return ( <Text style={[ styles.line, isActive ? styles.activeLine : styles.inactiveLine ]}>{item.text}</Text> );
        }}
        keyExtractor={(item, index) => `${item.time}-${index}`} // Key duy nhất cho mỗi dòng
        ListFooterComponent={<View style={{ height: SCREEN_HEIGHT * 0.3 }} />} // Đệm dưới cùng
        ListEmptyComponent={() => { // Hiển thị nếu không có lyrics
          if (!isLoading && currentSong) { return <Text style={styles.line}>Không có lời bài hát cho bài này.</Text>; }
          return null;
        }}
        scrollEnabled={!isSeeking} // Tắt cuộn lyrics khi đang tua
        onScrollToIndexFailed={handleScrollToIndexFailed} // Xử lý lỗi cuộn
        // Các props tối ưu hóa FlatList
        removeClippedSubviews={true}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
        getItemLayout={(data, index) => ( {length: 50, offset: 50 * index, index} )} // Giúp FlatList tính toán vị trí
      />

      {/* Modal Thêm vào Playlist */}
      <AddToPlaylistModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} currentSongId={currentSong ? currentSong.id : null} />
    </SafeAreaView>
  );
}


// --- Styles (CSS) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 0, paddingVertical: 10, width: '100%', },
  image: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 20, backgroundColor: '#333' },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
  infoText: { flex: 1, marginHorizontal: 10 },
  iconButton: { padding: 10, justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  artist: { color: 'gray', fontSize: 18, marginTop: 5, textAlign: 'center' },
  progressContainer: { width: '100%', marginTop: 20 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 },
  timeText: { color: 'gray', fontSize: 12 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 40, paddingHorizontal: 20, marginBottom: 10, },
  playButton: { justifyContent: 'center', alignItems: 'center', width: 70, height: 70 },
  // Styles cho Lyrics
  line: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingVertical: 15, marginHorizontal: 20, height: 50 },
  inactiveLine: { color: 'gray', opacity: 0.7 },
  activeLine: { color: 'white', opacity: 1, transform: [{ scale: 1.05 }] },
  // Styles cho Âm lượng
  volumeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 15, marginBottom: 20, paddingHorizontal: 10, },
  volumeSlider: { flex: 1, height: 40, marginHorizontal: 10, },
});