// frontend/src/context/HistoryContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMockSongs } from '../data/songs';

const HISTORY_STORAGE_KEY = '@listening_history';
const MAX_HISTORY_LENGTH = 100; // Giới hạn lịch sử 100 bài

export const HistoryContext = createContext();

// Lấy danh sách bài hát đầy đủ một lần
const allSongs = getMockSongs();
// Tạo một Map để tra cứu bài hát bằng ID nhanh hơn
const allSongsMap = new Map(allSongs.map(song => [song.id, song]));

export const HistoryProvider = ({ children }) => {
    const [historySongIDs, setHistorySongIDs] = useState([]);
    const [historySongs, setHistorySongs] = useState([]);

    // Tải lịch sử từ AsyncStorage khi khởi động
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
                const ids = jsonValue != null ? JSON.parse(jsonValue) : [];
                setHistorySongIDs(ids);
                
                // Chuyển đổi mảng ID thành mảng đối tượng Song
                const songs = ids.map(id => allSongsMap.get(id)).filter(Boolean); // Lọc ra các bài hát còn tồn tại
                setHistorySongs(songs);
                console.log("Đã tải lịch sử nghe nhạc:", songs.length, "bài");

            } catch (e) {
                console.error("Lỗi tải lịch sử nghe nhạc:", e);
            }
        };
        loadHistory();
    }, []);

    // Hàm nội bộ để lưu ID vào AsyncStorage
    const saveHistory = async (ids) => {
        try {
            const jsonValue = JSON.stringify(ids);
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error("Lỗi lưu lịch sử nghe nhạc:", e);
        }
    };

    // Hàm thêm bài hát vào lịch sử (được gọi từ AudioContext)
    const addSongToHistory = (song) => {
        if (!song || !song.id) return; // Bỏ qua nếu bài hát không hợp lệ

        setHistorySongIDs(prevIDs => {
            // 1. Xóa ID cũ nếu đã tồn tại (để đưa lên đầu)
            const filteredIDs = prevIDs.filter(id => id !== song.id);
            
            // 2. Thêm ID mới vào đầu danh sách
            const newIDs = [song.id, ...filteredIDs];
            
            // 3. Giới hạn độ dài của lịch sử
            if (newIDs.length > MAX_HISTORY_LENGTH) {
                newIDs.pop(); // Xóa bài hát cũ nhất (cuối mảng)
            }

            // 4. Cập nhật state chứa các đối tượng Song (để UI hiển thị)
            const songs = newIDs.map(id => allSongsMap.get(id)).filter(Boolean);
            setHistorySongs(songs);
            
            // 5. Lưu (bất đồng bộ) vào AsyncStorage
            saveHistory(newIDs);
            
            return newIDs;
        });
    };

    // Cung cấp danh sách bài hát (object) và hàm thêm
    const value = {
        historySongs, 
        addSongToHistory,
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
};

// Hook tùy chỉnh để dễ dàng sử dụng context
export const useHistory = () => {
    return useContext(HistoryContext);
};