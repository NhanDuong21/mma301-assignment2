# mma301-assignment2

Assignment 2 MMA301 — ứng dụng bán hàng dùng React Native, Expo và JavaScript.

## Workflow

Catalog DummyJSON → tìm kiếm/phân trang/refresh → chi tiết → thêm/sửa giỏ → lưu AsyncStorage.
Wishlist dùng Firebase Anonymous Auth + Firestore. Gemini tư vấn theo tối đa 24 kết quả
catalog thực qua proxy Node. Thông báo local nhắc giỏ hàng sau 60 giây khi người dùng bật.

**Trạng thái:** code tích hợp đã có; Firebase/Gemini cần cấu hình và xác minh với dịch vụ thật.
Chưa có APK/AAB release. Không coi Android JS export là bằng chứng cài/chạy release.

### Chạy project

Yêu cầu: Node.js 22+ (máy hiện tại Node 24), npm, Android/LDPlayer với Expo Go tương thích SDK 57.

```sh
npm install
npm start -- --clear
```

Android: mở Expo Go tương thích SDK 57, quét mã QR trong terminal hoặc nhập URL `exp://<IP-máy-tính>:8081`.
Máy tính và điện thoại nên dùng cùng mạng Wi-Fi.
Nếu dùng Android Emulator, mở máy ảo trước rồi nhấn `a` trong terminal Expo.

### Các file chính

- `index.js`: đăng ký component gốc của ứng dụng.
- `App.js`: ghép providers, safe area và bộ điều hướng gốc.
- `app.json`: cấu hình tên, icon và các thiết lập Expo.
- `package.json`: thư viện, phiên bản và lệnh chạy.
- `package-lock.json`: khóa phiên bản dependency để cài lại nhất quán.
- `assets/`: icon và ảnh có sẵn của template.
- `.gitignore`: bỏ qua dependency, cache và file tự sinh khi dùng Git.

## Cấu hình Firebase

1. Tạo Firebase project và đăng ký **Web App** trong Firebase Console.
2. Authentication → Sign-in method → bật **Anonymous**.
3. Tạo Cloud Firestore database; dán nội dung `firestore.rules` vào tab Rules và Publish.
4. Copy `.env.example` thành `.env` ở root. Điền 4 trường Firebase từ Web App config.
5. Khởi động lại Metro bằng `npm start -- --clear`.
6. Vào chi tiết → lưu yêu thích → mở Yêu thích → đọc lại từ Firebase.
7. Xác minh document ở `users/{uid}/wishlist/{productId}` trong Console. Thử rules deny và mạng lỗi theo test matrix.

Không điền service account/private key vào app. Các biến `EXPO_PUBLIC_*` sẽ xuất hiện
trong bundle; Firebase client config không thay thế Auth/rules. File `.env` bị Git ignore.
Anonymous UID được giữ bằng AsyncStorage; xóa app/data có thể mất quyền vào wishlist cũ.
Giỏ hàng lưu local, không tự đồng bộ lên Firebase.

## Cấu hình Gemini proxy

API key Gemini chỉ đặt ở server; app không chứa key này.

1. Tạo Gemini API key của bạn, kiểm tra quota và model còn khả dụng trong Google AI Studio.
2. Copy `server/.env.example` thành `server/.env`. Điền `GEMINI_API_KEY`,
   `GEMINI_MODEL` và `FIREBASE_WEB_API_KEY` **cùng project Firebase với app**.
3. Chạy `npm run server` (một terminal riêng). `/health` cho biết trạng thái cấu hình,
   không chứng minh key/quota hợp lệ cho tới khi request thật thành công.
4. Để truy cập từ LDPlayer/điện thoại: đặt `HOST=0.0.0.0` trong `server/.env`;
   đặt `EXPO_PUBLIC_AI_PROXY_URL=http://<IP-LAN-máy-tính>:3001` trong `.env` của app.
5. Khởi động lại Metro. Mở Tư vấn AI, nhập từ khóa tiếng Anh để tìm catalog và nhu cầu tiếng Việt.

Proxy xác minh Firebase ID token, tự lấy catalog từ DummyJSON, giới hạn 5 request/UID/phút,
gọi Gemini với schema JSON, từ chối ID giả/trùng/hết hàng. App validate/match một lần nữa.
Khi từ khóa không có kết quả, không gọi Gemini. Không có câu trả lời AI giả khi thiếu key.
Integration tests dùng upstream giả lập và **không được tính là bằng chứng Gemini thật**.

Proxy hiện dành cho bài tập trên máy/LAN. Khi đưa ra Internet cần HTTPS, App Check hoặc
chính sách chống abuse bổ sung, giới hạn ngân sách và rate limit dùng chung giữa các instance.
HTTP LAN chỉ dành cho dev; bản release nên trỏ đến HTTPS endpoint. Không dùng `localhost`
trong app trên máy ảo để trỏ về PC. Không log token, prompt có thông tin riêng hoặc key.

## Thông báo

- Thêm hàng → Cài đặt → Cho phép và bật nhắc. Giữ app mở hoặc đưa về nền, chờ khoảng 60 giây.
- Giỏ thay đổi sẽ cập nhật nội dung/lịch; giỏ trống hoặc tắt nhắc sẽ hủy lịch.
- Chạm thông báo mở Giỏ hàng, kể cả khi app khởi động từ trạng thái đã đóng.
- Từ chối quyền: hiển thị phản hồi, không chặn catalog/cart; bật lại quyền ở Android Settings nếu cần.
- Một số Expo Go SDK 57 cũ thiếu `ExpoTopicSubscriptionModule`. App phát hiện và báo tính năng
  chưa khả dụng thay vì crash. Cần preview APK có plugin để kiểm tra permission/schedule đầy đủ.
- Đây là **local notification**, không đăng ký remote push token. OS có thể trì hoãn khi tiết kiệm pin.

## Kiểm tra

```sh
npm test
npm run check:server
npm run check:deps
npx expo-doctor
npm run export:android
```

Test tự động bao phủ reducer/cart tiền/restore, validation catalog/AI và proxy HTTP/auth/rate limit.
Không thay thế test UI, rules Firebase, notification OS và release trên thiết bị thật.
`npm audit` hiện có cảnh báo dependency transitive Expo/Firebase (xem `docs/verification.md`);
không chạy `npm audit fix --force` vì nó đề nghị hạ SDK/Firebase không tương thích.

## Build Android release

`app.json` đã khai báo package `com.nyanduong.mma301assignment2` và plugin thông báo.
`eas.json`: `preview` tạo APK internal; `production` tạo AAB. Không cần Metro khi chạy preview APK.

1. Kiểm tra tên project theo quy ước lớp, package ID, icon và `.env` trước build.
2. `npx eas-cli@latest login` rồi `npx eas-cli@latest init` để gắn project với tài khoản của bạn.
3. Đặt các biến `EXPO_PUBLIC_FIREBASE_*` và `EXPO_PUBLIC_AI_PROXY_URL` trên EAS environment
   **preview** (và **production** nếu dùng). File `.env` local bị `.easignore` loại khỏi upload;
   không đặt Gemini key trong EAS app environment.
4. `npx eas-cli@latest build --platform android --profile preview`.
5. Tải APK, cài vào Android/LDPlayer, **tắt Metro** và chạy core workflow.
6. Ghi build URL, version, APK/checksum, ngày kiểm tra và kết quả vào `docs/verification.md`.
7. Nếu cần AAB: `npx eas-cli@latest build --platform android --profile production`.

Chưa thực hiện build EAS vì chưa có tài khoản/project/credentials được cấu hình.

## Bản đồ code và tài liệu audit

- `src/navigation/`: route và mở cart từ notification.
- `src/screens/`, `src/components/`: UI và thao tác.
- `src/hooks/useProducts.js`: query/request generation, pagination guard, refresh/retry.
- `src/contexts/`: cart dùng chung, wishlist và nhắc giỏ hàng.
- `src/services/`: HTTP, product API, Firebase, AI, notifications.
- `src/domain/`: hàm thuần được dùng ở app/tests; AI validator còn dùng ở proxy.
- `src/storage/`: cart và tùy chọn thông báo.
- `server/`: proxy Gemini, đọc config từ server/.env.
- `docs/architecture.md`: decision record + integration map.
- `docs/rtm.md`: requirement → code → test.
- `docs/test-matrix.md`: 15 nhóm case và trạng thái xác minh.
- `docs/debug-log.md`: lỗi thật và retest.
- `docs/verification.md`: kết quả kiểm tra và phần còn cần làm.
- `docs/ai-usage.md`: ghi nhận hỗ trợ AI và checklist audit của sinh viên.

## Giới hạn

Không thanh toán thật, không checkout/order history. Wishlist là Firebase use case được chọn.
Giá USD từ DummyJSON, giá trong giỏ là snapshot lúc thêm; không có đảm bảo giá/tồn kho giao dịch thật.
Search theo endpoint DummyJSON; không có category filter riêng. Chỉ Android được export kiểm tra.
Web script của template chưa cài runtime web; iOS/web chưa được xác minh.
