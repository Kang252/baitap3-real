// frontend/src/context/DownloadContext.js
import React, { createContext, useState, useEffect, useContext, useRef } from 'react'; // <-- Đảm bảo useRef có ở đây
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADS_KEY = '@song_downloads';

export const DOWNLOAD_STATUS = {
  NOT_DOWNLOADED: 'not_downloaded',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  ERROR: 'error',
};

export const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState({});
  
  // downloadProgress được khởi tạo bằng useRef
  const downloadProgress = useRef({});
  // --- SỬA LỖI: Tải danh sách download khi khởi động ---
  useEffect(() => {
    const loadDownloads = async () => {
      try {
        const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
        if (data) {
          const loadedDownloads = JSON.parse(data);
          
          // Kiểm tra xem tệp có thực sự tồn tại không
          const verifiedDownloads = {};
          for (const songId in loadedDownloads) {
            const item = loadedDownloads[songId];
            if (item.status === DOWNLOAD_STATUS.DOWNLOADED && item.localUri) {
              const fileInfo = await FileSystem.getInfoAsync(item.localUri);
              if (fileInfo.exists) {
                verifiedDownloads[songId] = item;
              } else {
                console.warn(`File đã tải ${item.localUri} không còn tồn tại.`);
              }
            }
          }
          setDownloads(verifiedDownloads);
          console.log("Đã tải danh sách download:", Object.keys(verifiedDownloads).length, "tệp");
        }
      } catch (e) {
        console.error("Lỗi tải danh sách download:", e);
      }
    };
    loadDownloads();
  }, []);
  // --- KẾT THÚC SỬA LỖI ---


  // Lưu vào storage mỗi khi 'downloads' thay đổi
  useEffect(() => {
    const saveDownloads = async () => {
      try {
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
      } catch (e) {
        console.error("Lỗi lưu danh sách download:", e);
      }
    };
    saveDownloads();
  }, [downloads]);

  const startDownload = async (song) => {
    // --- SỬA LỖI: Không tải nếu trackUrl không phải là string (link) ---
    // (Chúng ta không thể tải tệp 'require()')
    if (typeof song.trackUrl !== 'string') {
        console.warn(`Không thể tải bài hát "${song.title}" vì nó là tệp cục bộ (require).`);
        // Tùy chọn: Đặt trạng thái lỗi
        setDownloads(prev => ({
            ...prev,
            [song.id]: { status: DOWNLOAD_STATUS.ERROR, progress: 0, localUri: null, error: "Tệp cục bộ" }
        }));
        return;
    }
    // --- KẾT THÚC SỬA LỖI ---

    const sourceUrl = song.trackUrl; // Đã kiểm tra là string
    const filename = `${song.id}_${song.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    const localUri = FileSystem.documentDirectory + filename;

    // Cập nhật trạng thái sang "đang tải"
    setDownloads(prev => ({
      ...prev,
      [song.id]: { status: DOWNLOAD_STATUS.DOWNLOADING, progress: 0, localUri: null }
    }));

    const callback = downloadProgress => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      setDownloads(prev => ({
        ...prev,
        [song.id]: { ...prev[song.id], status: DOWNLOAD_STATUS.DOWNLOADING, progress }
      }));
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      sourceUrl,
      localUri,
      {},
      callback
    );

    downloadProgress.current[song.id] = downloadResumable;

    try {
      const { uri } = await downloadResumable.downloadAsync();
      console.log('Tải xong, lưu tại:', uri);
      setDownloads(prev => ({
        ...prev,
        [song.id]: { status: DOWNLOAD_STATUS.DOWNLOADED, progress: 1, localUri: uri }
      }));
      delete downloadProgress.current[song.id];
    } catch (e) {
      console.error('Lỗi khi bắt đầu tải:', e);
      setDownloads(prev => ({
        ...prev,
        [song.id]: { status: DOWNLOAD_STATUS.ERROR, progress: 0, localUri: null, error: e.message }
      }));
       delete downloadProgress.current[song.id];
    }
  };

  const cancelDownload = async (songId) => {
    const downloadInstance = downloadProgress.current[songId];
    if (downloadInstance) {
      try {
        await downloadInstance.pauseAsync(); // Tạm dừng
        // (Có thể dùng .cancelAsync() nếu muốn hủy hoàn toàn)
        console.log("Đã tạm dừng tải:", songId);
      } catch (e) {
        console.error("Lỗi khi dừng tải:", e);
      }
    }
    // Reset trạng thái
    setDownloads(prev => ({
      ...prev,
      [songId]: { status: DOWNLOAD_STATUS.NOT_DOWNLOADED, progress: 0, localUri: null }
    }));
    delete downloadProgress.current[songId];
  };

  const deleteDownload = async (songId) => {
    const downloadItem = downloads[songId];
    if (downloadItem && downloadItem.localUri) {
      try {
        await FileSystem.deleteAsync(downloadItem.localUri);
        console.log("Đã xóa tệp:", downloadItem.localUri);
      } catch (e) {
        console.error("Lỗi khi xóa tệp:", e);
      }
    }
    // Cập nhật state (xóa khỏi danh sách)
    setDownloads(prev => {
      const newDownloads = { ...prev };
      delete newDownloads[songId];
      return newDownloads;
    });
  };

  const getDownloadStatus = (songId) => {
    return downloads[songId] || { status: DOWNLOAD_STATUS.NOT_DOWNLOADED, progress: 0, localUri: null };
  };

  const value = {
    downloads,
    startDownload,
    cancelDownload,
    deleteDownload,
    getDownloadStatus,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  return useContext(DownloadContext);
};