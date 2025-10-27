// frontend/app/(tabs)/home.js
import React, { useMemo } from 'react'; // Thêm useMemo
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SongItem from '../../src/components/SongItem';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import { getMockSongs } from '../../src/data/songs';
import { useFavorites } from '../../src/context/FavoritesContext';
import { usePlaylists } from '../../src/context/PlaylistsContext';

const allSongs = getMockSongs();

export default function HomeScreen() {
    
    const { playSong } = useAudioPlayer();
    const { favorites } = useFavorites();
    const { playlists } = usePlaylists();

    const handlePlaySong = (track, queue) => {
        playSong(track, queue);
    };

    const favoriteList = favorites || [];
    
    // --- BỔ SUNG FR-8.1: Gợi ý cho bạn (Mô phỏng) ---
    // Lấy 5 bài hát ngẫu nhiên làm gợi ý
    const recommendations = useMemo(() => {
        return [...allSongs].sort(() => 0.5 - Math.random()).slice(0, 5);
    }, [allSongs]);
    // --- KẾT THÚC BỔ SUNG ---

    // --- BỔ SUNG FR-8.2: Thịnh hành (Mô phỏng) ---
    // Lấy các bài hát Pop làm thịnh hành
    const trendingPop = useMemo(() => {
        return allSongs.filter(s => s.genre?.includes('Pop')).slice(0, 5);
    }, [allSongs]);
    // --- KẾT THÚC BỔ SUNG ---


    const sections = [
        {
            title: 'Mới phát hành', // Giữ lại mục này
            data: allSongs.slice(0, 5),
            horizontal: true,
            queue: allSongs,
        },
        // --- BỔ SUNG FR-8.1 ---
        {
            title: 'Gợi ý cho bạn',
            data: recommendations,
            horizontal: true,
            queue: recommendations,
        },
        // --- KẾT THÚC BỔ SUNG ---
        {
            title: 'Bài hát yêu thích',
            data: favoriteList.slice(0, 5),
            horizontal: true,
            queue: favoriteList,
        },
        // --- BỔ SUNG FR-8.2 ---
        {
            title: 'Thịnh hành Pop',
            data: trendingPop,
            horizontal: true,
            queue: trendingPop,
        },
        // --- KẾT THÚC BỔ SUNG ---
        {
            title: 'Tất cả bài hát',
            data: allSongs,
            horizontal: false, // Danh sách dọc
            queue: allSongs,
        },
    ];

    // Render item chung
    const renderSongItem = ({ item, queue }) => (
        <SongItem 
            item={item}
            onPlayPress={() => handlePlaySong(item, queue)}
            queue={queue}
        />
    );

    // Render item cho danh sách ngang
    const renderHorizontalList = ({ item, queue }) => (
        <View style={styles.horizontalItemContainer}>
            <SongItem 
                item={item}
                onPlayPress={() => handlePlaySong(item, queue)}
                queue={queue}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={sections}
                keyExtractor={(item, index) => item.title + index}
                renderItem={({ item: section }) => (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.horizontal ? (
                            <FlatList
                                data={section.data}
                                renderItem={({ item: songItem }) => renderHorizontalList({ item: songItem, queue: section.queue })}
                                keyExtractor={(song) => song.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                // Thêm padding để thấy item cuối
                                contentContainerStyle={{ paddingHorizontal: 10 }} 
                            />
                        ) : (
                            // Render danh sách dọc
                            <FlatList
                                data={section.data}
                                renderItem={({ item: songItem }) => renderSongItem({ item: songItem, queue: section.queue })}
                                keyExtractor={(song) => song.id}
                            />
                        )}
                    </View>
                )}
                ListFooterComponent={<View style={{ height: 60 }} />} // Thêm khoảng trống cho MiniPlayer
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 15, // Căn lề thống nhất
        marginBottom: 10,
    },
    horizontalItemContainer: {
        width: 150, // Chiều rộng cho item ngang
        marginHorizontal: 5, // Khoảng cách giữa các item
    },
});