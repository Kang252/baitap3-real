// frontend/app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from '../src/context/AudioContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { PlaylistsProvider } from '../src/context/PlaylistsContext';
import { DownloadProvider } from '../src/context/DownloadContext';
// --- BỔ SUNG FR-8.3 ---
import { HistoryProvider } from '../src/context/HistoryContext'; 
// --- KẾT THÚC BỔ SUNG ---

// Ẩn cảnh báo không liên quan (nếu có)
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']);

export default function RootLayout() {
  
  return (
    <FavoritesProvider>
      <PlaylistsProvider>
        <DownloadProvider>
          {/* --- BỔ SUNG FR-8.3 ---
            HistoryProvider phải bao bọc AudioProvider
            để AudioProvider có thể gọi hàm addSongToHistory
          */}
          <HistoryProvider> 
            <AudioProvider>
              
              <StatusBar style="light" />
              
              <Stack screenOptions={{ headerShown: false }}>
                
                <Stack.Screen name="(tabs)" /> 
                <Stack.Screen 
                  name="player" 
                  options={{ presentation: 'modal' }} 
                />
                <Stack.Screen 
                  name="playlist/[id]" 
                  options={{ presentation: 'modal' }} 
                />

              </Stack>

            </AudioProvider>
          </HistoryProvider>
          {/* --- KẾT THÚC BỔ SUNG --- */}
        </DownloadProvider>
      </PlaylistsProvider>
    </FavoritesProvider>
  );
}