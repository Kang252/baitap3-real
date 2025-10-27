// frontend/src/components/SongItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
// --- SỬA LỖI ĐƯỜNG DẪN ---
import { useAudioPlayer } from '../hooks/useAudioPlayer'; // Đường dẫn đúng
// --- KẾT THÚC SỬA ---
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '../context/DownloadContext';

const DOWNLOAD_STATUS = {
  NOT_DOWNLOADED: 'not_downloaded',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  ERROR: 'error',
};

export default function SongItem({ item, onPlayPress, queue, onRemovePress }) {
  const router = useRouter();
  const { playSong, isPlaying, currentSong } = useAudioPlayer();
  const { startDownload, getDownloadStatus, cancelDownload, deleteDownload } = useDownloads();

  const handlePress = () => {
    if (onPlayPress) {
      // Gọi hàm onPlayPress được truyền từ cha (home.js, library.js, ...)
      onPlayPress(item, queue); 
    } else {
      // Hành động mặc định (ví dụ: từ playlist detail)
      playSong(item, queue || [item]);
      // Không tự động chuyển màn hình, để MiniPlayer xử lý
      // router.push('/player');
    }
  };

  // Đảm bảo item tồn tại trước khi truy cập id
  const downloadState = item?.id ? getDownloadStatus(item.id) : { status: DOWNLOAD_STATUS.NOT_DOWNLOADED, progress: 0, localUri: null };

  const handleDownloadAction = (e) => {
    e.stopPropagation();
    if (!item || !item.id) {
        console.error("handleDownloadAction: Item hoặc item.id không hợp lệ.");
        return;
    }

    switch (downloadState.status) {
      case DOWNLOAD_STATUS.NOT_DOWNLOADED:
      case DOWNLOAD_STATUS.ERROR:
        startDownload(item);
        break;
      case DOWNLOAD_STATUS.DOWNLOADING:
        cancelDownload(item.id);
        break;
      case DOWNLOAD_STATUS.DOWNLOADED:
        deleteDownload(item.id);
        break;
      default:
        break;
    }
  };

  const renderDownloadStatus = () => {
    return (
      <Pressable style={styles.downloadButton} onPress={handleDownloadAction}>
        {downloadState.status === DOWNLOAD_STATUS.DOWNLOADING && (
          <ActivityIndicator size="small" color="#1DB954" />
        )}
        {downloadState.status === DOWNLOAD_STATUS.DOWNLOADED && (
          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
        )}
         {downloadState.status === DOWNLOAD_STATUS.ERROR && (
           <Ionicons name="alert-circle-outline" size={24} color="orange" />
         )}
         {downloadState.status === DOWNLOAD_STATUS.NOT_DOWNLOADED && (
           <Ionicons name="download-outline" size={24} color="gray" />
         )}
      </Pressable>
    );
  };

  // Nếu item không hợp lệ, không render gì cả
  if (!item || !item.id) {
    return null;
  }

  const isActive = item.id === currentSong?.id;

  const imageSource = (typeof item.imageUrl === 'string')
    ? { uri: item.imageUrl }
    : item.imageUrl;

  return (
    <View style={styles.outerContainer}>
        <Pressable style={styles.mainContent} onPress={handlePress}>
          <Image
            source={imageSource}
            style={styles.image}
            defaultSource={require('../../assets/images/default-album-art.png')}
          />
          <View style={styles.infoContainer}>
            <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>{item.title || 'Unknown Title'}</Text>
            <Text style={[styles.artist, isActive && styles.activeText]} numberOfLines={1}>{item.artist || 'Unknown Artist'}</Text>
          </View>
           {isActive && (
                <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={24}
                    color="#1DB954"
                    style={styles.activeIcon}
                />
            )}
          {onRemovePress && (
            <Pressable
              style={styles.actionButton}
              onPress={(e) => { e.stopPropagation(); onRemovePress(); }}
            >
              <Ionicons name="remove-circle-outline" size={24} color="gray" />
            </Pressable>
          )}
        </Pressable>

        {renderDownloadStatus()}
    </View>
  );
}

const styles = StyleSheet.create({
    outerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    image: { width: 50, height: 50, borderRadius: 4, marginRight: 15, backgroundColor: '#333' },
    infoContainer: { flex: 1, marginRight: 10 },
    title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    artist: { color: 'gray', fontSize: 14 },
    activeText: {
        color: '#1DB954',
    },
    activeIcon: {
        marginRight: 10,
    },
    actionButton: {
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    downloadButton: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
        minHeight: 44,
    }
});