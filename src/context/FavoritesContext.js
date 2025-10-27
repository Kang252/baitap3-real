// frontend/src/context/FavoritesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMockSongs } from '../data/songs'; // Import để tra cứu bài hát

const FAVORITES_KEY = '@favorites_songs';

export const FavoritesContext = createContext();

// Lấy danh sách bài hát đầy đủ một lần
const allSongs = getMockSongs();
// Tạo Map để tra cứu bài hát bằng ID nhanh hơn
const allSongsMap = new Map(allSongs.map(song => [song.id, song]));

export const FavoritesProvider = ({ children }) => {
    // State bây giờ lưu mảng các đối tượng song đầy đủ
    const [favorites, setFavorites] = useState([]); 
    // State phụ lưu trữ Set các ID để kiểm tra nhanh
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    // Tải danh sách yêu thích khi khởi động
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
                // AsyncStorage có thể lưu mảng ID hoặc mảng object (chúng ta sẽ lưu object)
                const loadedFavorites = jsonValue != null ? JSON.parse(jsonValue) : [];
                
                // Đảm bảo dữ liệu tải lên là đối tượng song hợp lệ
                const validFavorites = loadedFavorites
                    .map(fav => typeof fav === 'string' ? allSongsMap.get(fav) : fav) // Chuyển đổi ID thành object nếu cần
                    .filter(song => song && song.id && allSongsMap.has(song.id)); // Lọc bỏ bài hát không hợp lệ/không còn tồn tại

                setFavorites(validFavorites);
                setFavoriteIds(new Set(validFavorites.map(song => song.id)));
                console.log("Đã tải danh sách Yêu thích từ AsyncStorage:", validFavorites.length, "bài");
            } catch (e) {
                console.error("Lỗi tải danh sách Yêu thích:", e);
            }
        };
        loadFavorites();
    }, []);

    // Lưu lại mỗi khi favorites thay đổi
    useEffect(() => {
        const saveFavorites = async () => {
            try {
                // Lưu mảng các đối tượng song đầy đủ
                const jsonValue = JSON.stringify(favorites);
                await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
            } catch (e) {
                console.error("Lỗi lưu danh sách Yêu thích:", e);
            }
        };
        saveFavorites();
    }, [favorites]);

    // Thêm bài hát vào danh sách yêu thích
    const addFavorite = (song) => {
        if (!song || !song.id) {
            console.warn("addFavorite: Bài hát không hợp lệ.");
            return;
        }
        // Kiểm tra xem bài hát đã tồn tại chưa bằng Set
        if (!favoriteIds.has(song.id)) {
            console.log("Adding favorite:", song.title);
            // Cập nhật state mảng object
            setFavorites(prevFavorites => [...prevFavorites, song]);
            // Cập nhật state Set ID
            setFavoriteIds(prevIds => new Set(prevIds).add(song.id));
        } else {
             console.log("Bài hát đã có trong yêu thích:", song.title);
        }
    };

    // Xóa bài hát khỏi danh sách yêu thích
    const removeFavorite = (songId) => {
         if (!songId) {
             console.warn("removeFavorite: ID bài hát không hợp lệ.");
             return;
         }
        console.log("Removing favorite:", songId);
        // Cập nhật state mảng object
        setFavorites(prevFavorites => prevFavorites.filter(song => song.id !== songId));
        // Cập nhật state Set ID
        setFavoriteIds(prevIds => {
            const newIds = new Set(prevIds);
            newIds.delete(songId);
            return newIds;
        });
    };

    // Kiểm tra xem bài hát có trong danh sách yêu thích không
    const isFavorite = (songId) => {
        return favoriteIds.has(songId);
    };

    const value = {
        favorites, // Cung cấp mảng các object song
        addFavorite,
        removeFavorite,
        isFavorite,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Hook tùy chỉnh
export const useFavorites = () => {
    return useContext(FavoritesContext);
};