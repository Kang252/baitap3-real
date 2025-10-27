// frontend/src/components/MiniPlayer.js
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer'; // Đảm bảo đường dẫn này đúng
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MiniPlayer() {
  const router = useRouter();

  const {
    currentSong,
    isPlaying,
    handlePlayPause,
    positionMillis,
    durationMillis,
    isLoading,
  } = useAudioPlayer();

  if (!currentSong) {
    return null; // Không hiển thị gì nếu không có bài hát
  }

  const getProgress = () => {
    if (!durationMillis || durationMillis === 0) return 0;
    return (positionMillis / durationMillis) * 100;
  };

  const onPlayPausePress = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra component cha
    handlePlayPause();
  };

  const openPlayerScreen = () => {
    router.push('/player'); // Điều hướng đến màn hình Player
  };

  // Xử lý nguồn ảnh (require vs uri)
  const imageSource = (typeof currentSong.imageUrl === 'string')
    ? { uri: currentSong.imageUrl }
    : currentSong.imageUrl;

  return (
    <Pressable style={styles.container} onPress={openPlayerScreen}>
      <View style={styles.progressBarBackground}>
        <View
          style={[styles.progressBarFill, { width: `${getProgress()}%` }]}
        />
      </View>

      <View style={styles.content}>
        <Image
            source={imageSource}
            style={styles.image}
            defaultSource={require('../../assets/images/default-album-art.png')}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title || ''}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist || ''}
          </Text>
        </View>

        <Pressable style={styles.iconButton} onPress={onPlayPausePress} disabled={isLoading}>
           {isLoading ? (
               <ActivityIndicator size={28} color="white" />
           ) : (
               <Ionicons
                 name={isPlaying ? "pause" : "play"}
                 size={28}
                 color="white"
               />
           )}
        </Pressable>

      </View>
    </Pressable>
  );
}

// --- SỬA LỖI ---
// Đã loại bỏ 'position: absolute' và 'bottom', 'left', 'right'
// MiniPlayer giờ là một component bình thường
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a', // Màu nền của MiniPlayer
    width: '100%',
    // KHÔNG CÒN position: 'absolute'
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: '#535353',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    height: 60, // Chiều cao cố định cho MiniPlayer
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: 'gray',
    fontSize: 12,
  },
  iconButton: {
    padding: 5,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});