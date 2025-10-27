// frontend/src/data/songs.js

// LƯU Ý: Đường dẫn require phải chính xác từ file AudioContext.js đến file MP3
// Nếu AudioContext.js nằm trong src/context/, đường dẫn sẽ là '../../assets/audio/...'

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Bước Qua Nhau',
    artist: 'Vũ.',
    imageUrl: require('../../assets/images/buocquanhau.jpg'),
    trackUrl: require('../../assets/audio/BuocQuaNhau.mp3'),
    // --- BỔ SUNG FR-6.4 ---
    album: '25',
    genre: 'Indie Pop',
    // --- KẾT THÚC BỔ SUNG ---
    lyrics: `
[00:15.65] Hôm nay sao tôi thấy cô đơn lạ thường
[00:19.40] Từng dòng người vội đi trên phố đông
[00:23.09] Ai cũng có một người để nhớ mong
[00:26.54] Chờ đợi một người gọi đến cuối ngày
[00:30.40] Hôm nay sao tôi thấy không vui bằng người
[00:34.22] Chạy thật chậm dưới cơn mưa rất vội
[00:37.89] Chỉ là tôi nhớ em thôi em ơi
[00:41.60] Chuyện tình mình tựa cơn mưa không lời
[00:45.33] Tôi vẫn thế, vẫn đợi em dẫu biết nay xa vời
[00:52.61] Vẫn đợi một điều gì đó đã qua lâu rồi
[00:59.88] Phải làm sao để quên người ơi?
[01:03.49] Phải làm sao để vơi sầu vơi?
[01:07.13] Cứ thế êm đềm, trôi
[01:14.65] Tình yêu nay đã xa xôi
[01:21.89] Chỉ còn tôi và những mộng mơ
[01:29.17] Chuyện tình mình giờ tựa trang giấy trắng
[01:32.72] Nhạt nhoà dần rồi lại phai phôi
[01:36.42] Cứ cố gắng mỉm cười, em hỡi
[01:40.09] Dù là bao khoảng cách chia đôi
[01:43.76] Chúng ta, rồi cũng sẽ bước qua nhau
[01:51.13] Để lại một người phía sau
[01:58.33] Chỉ còn lại những nỗi sầu
[02:05.62] Vùi mình vào đêm đen
[02:30.93] Hôm nay sao tôi thấy cô đơn lạ thường
[02:34.69] Từng dòng người vội đi trên phố đông
[02:38.32] Ai cũng có một người để nhớ mong
[02:41.81] Chờ đợi một người gọi đến cuối ngày
[02:45.69] Hôm nay sao tôi thấy không vui bằng người
[02:49.46] Chạy thật chậm dưới cơn mưa rất vội
[02:53.11] Chỉ là tôi nhớ em thôi em ơi
[02:56.84] Chuyện tình mình tựa cơn mưa không lời
[03:00.61] Tôi vẫn thế, vẫn đợi em dẫu biết nay xa vời
[03:07.87] Vẫn đợi một điều gì đó đã qua lâu rồi
[03:15.11] Phải làm sao để quên người ơi?
[03:18.73] Phải làm sao để vơi sầu vơi?
[03:22.40] Cứ thế êm đềm, trôi
[03:29.93] Tình yêu nay đã xa xôi
[03:37.08] Chỉ còn tôi và những mộng mơ
[03:44.40] Chuyện tình mình giờ tựa trang giấy trắng
[03:47.95] Nhạt nhoà dần rồi lại phai phôi
[03:51.65] Cứ cố gắng mỉm cười, em hỡi
[03:55.33] Dù là bao khoảng cách chia đôi
[03:58.98] Chúng ta, rồi cũng sẽ bước qua nhau
[04:06.35] Để lại một người phía sau
[04:13.60] Chỉ còn lại những nỗi sầu
[04:20.91] Vùi mình vào đêm đen
`
  },
  {
    id: '2',
    title: 'Tháng Mấy Em Nhớ Anh?',
    artist: 'Hà Anh Tuấn',
    imageUrl: require('../../assets/images/thangmayemnhoanh.jpg'),
    trackUrl: require('../../assets/audio/ThangMayEmNhoAnh.mp3'),
    // --- BỔ SUNG FR-6.4 ---
    album: 'CITOPIA',
    genre: 'Pop',
    // --- KẾT THÚC BỔ SUNG ---
    lyrics: `
[00:09.95] Tháng mấy mưa rơi nhiều hơn?
[00:14.61] Ánh mắt anh trông chờ hơn
[00:19.46] Em có đang cách xa anh cả một bầu trời?
[00:24.16] Hay chỉ là đôi phút rong chơi
[00:28.98] Tháng mấy ai hay buồn hơn?
[00:33.64] Góc phố anh nghe cô đơn
[00:38.50] Em có đang nhớ đến anh khi gió đông về?
[00:43.19] Hay bận lòng với những đam mê
[00:47.98] Điều gì làm em thấy vui?
[00:52.68] Điều gì làm em đắm say?
[00:57.44] Quên hết con đường, quên hết mọi điều
[01:02.16] Ta từng xem là của riêng
[01:06.94] Điều gì làm em nhớ anh?
[01:11.69] Điều gì làm em khát khao?
[01:16.48] Hay trái tim em giờ đây đã vội
[01:21.19] Trao một ai chẳng phải anh
[01:27.28] Em ơi...
[01:31.95] Tháng mấy em nhớ anh?
[01:36.63] Tháng mấy em hết buồn?
[01:41.35] Trái đất kia vẫn xoay
[01:46.06] Anh vẫn nơi đây
[01:50.80] Chờ em...
`
  },
  {
    id: '3',
    title: 'Nàng Thơ',
    artist: 'Hoàng Dũng',
    imageUrl: require('../../assets/images/nangtho.jpg'),
    trackUrl: require('../../assets/audio/NangTho.mp3'),
    // --- BỔ SUNG FR-6.4 ---
    album: 'Nàng Thơ (Single)',
    genre: 'Pop Ballad',
    // --- KẾT THÚC BỔ SUNG ---
    lyrics: `
[00:11.75] Em ngày em đánh rơi nụ cười vào anh
[00:17.52] Có nghĩ sau này em sẽ chờ
[00:22.77] Anh ngày anh đánh rơi nụ cười vào em
[00:28.53] Có nghĩ sau này anh sẽ tìm
[00:33.74] Tìm em trong những giấc mơ dịu dàng như là mây
[00:39.29] Tìm em trong những áng thơ tình đầu anh vụng tay
[00:44.75] Tìm em trong những sớm mai ngồi chờ sương nhẹ tan
[00:50.29] Giờ này em ở đâu
[00:56.03] Có khi anh bật khóc giữa đêm
[01:01.37] Rồi tự mình lau khô nước mắt
[01:06.88] Có khi anh thả trôi nỗi buồn
[01:12.35] Để mỉm cười khi đứng trước em
[01:17.88] Hoàng hôn buông xuống, bức tranh chiều tà
[01:23.14] Anh đi tìm màu mắt em
[01:28.91] Anh gọi em là Nàng Thơ
[01:34.19] Để cất em vào trong vần thơ
[01:39.69] Tình yêu anh giấu kín
[01:42.36] Bỗng nhiên em lại hóa thành Nàng Thơ
[01:48.07] Để giờ anh ngẩn ngơ
[01:50.88] Làm thơ tình theo gió mây
`
  },
];

// Hàm lấy dữ liệu tĩnh
export const getMockSongs = () => {
  return MOCK_SONGS;
};