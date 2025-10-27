// frontend/app/playlist/[id].js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlaylists } from '../../src/context/PlaylistsContext';
import { useFavorites } from '../../src/context/FavoritesContext';
// --- BỔ SUNG FR-8.3 ---
import { useHistory } from '../../src/context/HistoryContext'; // Import History
// --- KẾT THÚC BỔ SUNG ---
import { getMockSongs } from '../../src/data/songs';
import SongItem from '../../src/components/SongItem';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';

const allSongs = getMockSongs();

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { id: playlistId } = useLocalSearchParams(); 

  const { playlists, removeSongFromPlaylist } = usePlaylists();
  const { favorites } = useFavorites(); 
  // --- BỔ SUNG FR-8.3 ---
  const { historySongs } = useHistory(); // Lấy lịch sử (danh sách bài hát object)
  // --- KẾT THÚC BỔ SUNG ---
  const { playSong } = useAudioPlayer();

  // Xử lý nhiều loại ID (Favorites, History, Artist, Album, Playlist)
  const { playlistName, playlistSongs, isModifiable } = useMemo(() => {
    
    if (playlistId === 'favorites') {
      return {
        playlistName: 'Bài hát đã thích',
        playlistSongs: favorites || [],
        isModifiable: false, 
      };
    }

    // --- BỔ SUNG FR-8.3 ---
    if (playlistId === 'history') {
      return {
        playlistName: 'Lịch sử nghe nhạc',
        playlistSongs: historySongs || [], // Dùng trực tiếp mảng songs từ context
        isModifiable: false,
      };
    }
    // --- KẾT THÚC BỔ SUNG ---

    if (playlistId.startsWith('artist:')) {
      const artistName = playlistId.substring(7); 
      return {
        playlistName: artistName,
        playlistSongs: allSongs.filter(s => s.artist === artistName),
        isModifiable: false,
      };
    }

    if (playlistId.startsWith('album:')) {
      const albumName = playlistId.substring(6); 
      return {
        playlistName: albumName,
        playlistSongs: allSongs.filter(s => s.album === albumName),
        isModifiable: false,
      };
    }

    // Trường hợp mặc định: Playlist bình thường
    const currentPlaylist = (playlists || []).find(p => p.id === playlistId);
    if (currentPlaylist) {
       const songIDs = new Set(currentPlaylist.songIDs || []);
       return {
            playlistName: currentPlaylist.name,
            playlistSongs: allSongs.filter(song => songIDs.has(song.id)),
            isModifiable: true, 
       };
    }

    // Không tìm thấy
    return { playlistName: 'Không tìm thấy', playlistSongs: [], isModifiable: false };

  }, [playlistId, playlists, favorites, allSongs, historySongs]); // Thêm historySongs vào dependencies


  // Hàm xử lý nhấn để phát bài hát
  const handlePlaySongInList = (songItem) => {
    playSong(songItem, playlistSongs); 
  };

  // Hàm xóa bài hát (chỉ dùng cho playlist bình thường)
  const handleRemoveSong = (songId, songTitle) => {
    Alert.alert(
      "Xóa bài hát",
      `Bạn có chắc muốn xóa "${songTitle}" khỏi playlist "${playlistName}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            if (isModifiable && !playlistId.includes(':')) {
                removeSongFromPlaylist(playlistId, songId);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.header} numberOfLines={1}>{playlistName}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={playlistSongs}
        renderItem={({ item }) => (
          <SongItem
            item={item}
            onPlayPress={() => handlePlaySongInList(item)}
            queue={playlistSongs}
            // Chỉ hiển thị nút xóa nếu isModifiable là true
            onRemovePress={isModifiable ? () => handleRemoveSong(item.id, item.title) : undefined}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Danh sách này chưa có bài hát nào.</Text>
        }
        ListFooterComponent={<View style={{ height: 60 }} />}
      />
    </SafeAreaView>
  );
}

// (Styles giữ nguyên)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1, 
    marginHorizontal: 10, 
  },
  iconButton: {
    padding: 5,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});