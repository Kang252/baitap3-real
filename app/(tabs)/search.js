// frontend/app/(tabs)/search.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMockSongs } from '../../src/data/songs';
import SongItem from '../../src/components/SongItem';
// --- SỬA LỖI ĐƯỜNG DẪN ---
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer'; // Đường dẫn đúng
// --- KẾT THÚC SỬA ---
// MiniPlayer được quản lý bởi _layout.js
import { Ionicons } from '@expo/vector-icons';

const allSongs = getMockSongs();

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    
    const { playSong } = useAudioPlayer();

    const filteredSongs = useMemo(() => {
        if (!searchQuery) {
            return []; // Không hiển thị gì khi chưa tìm kiếm
        }
        const query = searchQuery.toLowerCase();
        return allSongs.filter(
            song =>
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handlePlaySong = (track) => {
        // Phát bài hát với queue là kết quả tìm kiếm
        playSong(track, filteredSongs.length > 0 ? filteredSongs : [track]); 
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Tìm kiếm</Text>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                    placeholderTextColor="gray"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredSongs}
                renderItem={({ item }) => (
                    <SongItem
                        item={item}
                        onPlayPress={() => handlePlaySong(item)}
                        queue={filteredSongs}
                    />
                )}
                keyExtractor={item => item.id}
                ListEmptyComponent={() => (
                     searchQuery ? <Text style={styles.emptyText}>Không tìm thấy kết quả.</Text> : <Text style={styles.emptyText}>Bắt đầu tìm kiếm...</Text>
                )}
                ListFooterComponent={<View style={{ height: 60 }} />}
            />
            
            {/* MiniPlayer được quản lý bởi _layout.js */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        padding: 15,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        marginHorizontal: 15,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 12,
    },
    emptyText: {
        color: 'gray',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});