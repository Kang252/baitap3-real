// frontend/app/(tabs)/library.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../src/context/FavoritesContext';
import { usePlaylists } from '../../src/context/PlaylistsContext';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import SongItem from '../../src/components/SongItem';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getMockSongs } from '../../src/data/songs'; 

const allSongs = getMockSongs();

export default function LibraryScreen() {
    const { favorites } = useFavorites(); 
    const { playlists, createPlaylist } = usePlaylists();
    const router = useRouter(); 

    const { playSong } = useAudioPlayer();

    const favoriteList = favorites || [];
    const playlistList = playlists || [];

    // (useMemo cho artists, albums giữ nguyên)
    const { artists, albums } = useMemo(() => {
        const artistSet = new Set();
        const albumSet = new Set();
        allSongs.forEach(song => {
            if (song.artist) artistSet.add(song.artist);
            if (song.album) albumSet.add(song.album);
        });
        return {
            artists: Array.from(artistSet).sort(),
            albums: Array.from(albumSet).sort(),
        };
    }, []); 

    const handlePlayFavorite = (track) => {
        playSong(track, favoriteList);
    };

    const handleCreatePlaylist = () => {
        Alert.prompt(
          "Tạo Playlist Mới", "Nhập tên cho playlist của bạn:",
          [{ text: "Hủy", style: "cancel" }, { text: "Tạo", onPress: (name) => {
              if (name) createPlaylist(name);
          } }],
          "plain-text"
        );
    };

    const renderHeader = () => (
        <View>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Thư viện</Text>
                <Pressable onPress={handleCreatePlaylist} style={styles.iconButton}>
                  <Ionicons name="add" size={30} color="#1DB954" />
                </Pressable>
            </View>
            
            {/* Mục Bài hát yêu thích */}
            <Link href="/playlist/favorites" asChild>
                <Pressable style={styles.menuItem}>
                    <Ionicons name="heart" size={28} color="#1DB954" />
                    <Text style={styles.menuText}>Bài hát đã thích</Text>
                    <Text style={styles.menuSubText}>{favoriteList.length} bài</Text>
                    <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevronIcon}/>
                </Pressable>
            </Link>

            {/* --- BỔ SUNG FR-8.3: Lịch sử --- */}
            <Link href="/playlist/history" asChild>
                <Pressable style={styles.menuItem}>
                    <MaterialIcons name="history" size={28} color="#fff" />
                    <Text style={styles.menuText}>Lịch sử nghe nhạc</Text>
                    <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevronIcon}/>
                </Pressable>
            </Link>
            {/* --- KẾT THÚC BỔ SUNG --- */}

            {/* (Mục Nghệ sĩ) */}
            <Text style={styles.subHeader}>Nghệ sĩ</Text>
            {artists.map(artist => (
                <Link href={`/playlist/artist:${artist}`} key={artist} asChild>
                    <Pressable style={styles.menuItem}>
                        <MaterialIcons name="person" size={28} color="#fff" />
                        <Text style={styles.menuText}>{artist}</Text>
                         <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevronIcon}/>
                    </Pressable>
                </Link>
            ))}

            {/* (Mục Album) */}
            <Text style={styles.subHeader}>Album</Text>
            {albums.map(album => (
                <Link href={`/playlist/album:${album}`} key={album} asChild>
                    <Pressable style={styles.menuItem}>
                        <MaterialIcons name="album" size={28} color="#fff" />
                        <Text style={styles.menuText}>{album}</Text>
                         <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevronIcon}/>
                    </Pressable>
                </Link>
            ))}

            {/* (Mục Playlists) */}
            <Text style={styles.subHeader}>Playlists</Text>
            {playlistList.map(playlist => (
                <Link href={`/playlist/${playlist.id}`} key={playlist.id} asChild>
                    <Pressable style={styles.menuItem}>
                        <Ionicons name="list" size={28} color="#fff" />
                        <Text style={styles.menuText}>{playlist.name}</Text>
                        <Text style={styles.menuSubText}>{playlist.songs?.length || 0} bài</Text>
                         <Ionicons name="chevron-forward" size={20} color="gray" style={styles.chevronIcon}/>
                    </Pressable>
                </Link>
            ))}

            {/* (Mục Yêu thích gần đây) */}
             <Text style={styles.subHeader}>Yêu thích gần đây</Text>
             {favoriteList.slice(0, 5).map(item => (
                <SongItem
                    key={item.id}
                    item={item}
                    onPlayPress={() => handlePlayFavorite(item)} 
                    queue={favoriteList}
                />
             ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[]} 
                ListHeaderComponent={renderHeader}
                ListFooterComponent={<View style={{ height: 60 }} />}
                keyExtractor={(item, index) => index.toString()}
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
    headerRow: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 15,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    iconButton: {
        padding: 5,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingHorizontal: 15,
        marginTop: 20,
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    menuText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 15,
        flex: 1, 
    },
    menuSubText: {
        color: 'gray',
        fontSize: 16,
        marginRight: 5,
    },
    chevronIcon: { 
    }
});