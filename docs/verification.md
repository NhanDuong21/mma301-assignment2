# Verification và việc còn lại

## Nâng Expo SDK 58 — 2026-10-29

- Expo `58.0.21` (npm `latest` tại thời điểm nâng), React `19.3.0`, React Native `0.88.0`.
- Đồng bộ dependency bằng `npx expo install --fix`; CLI thêm plugin `expo-status-bar`.
- `npm test`: 12/12 PASS; `npm run check:deps`: PASS; Expo Doctor: 20/20 PASS.
- `npm run export:android`: PASS (970 modules). Chưa kiểm tra UI/notification trên thiết bị hoặc build APK sau nâng cấp.
- Cần Expo Go tương thích SDK 58 hoặc build lại development/preview APK.
- npm báo 12 vulnerability (5 low, 7 high) sau cài đặt; chưa xử lý trong lần nâng SDK này.

## Kiểm tra trước nâng cấp

Ngày thực hiện: 2026-10-27. Môi trường: Windows, Node 24, npm 11, Expo SDK 57.

## Kết quả thực tế

- Android JS export từng phase 1–5 và lần kiểm tra cuối: PASS. Đây không phải APK/AAB.
- `node --test tests/*.test.cjs`: 10/10 PASS sau fix D01/D02.
- `node --check server/index.cjs`: PASS.
- `expo-doctor`: 21/21 PASS cả lần cuối sau cấu hình plugin/package release; dependency check PASS.
- API thật `GET /products?limit=12&skip=0`: nhận 12 sản phẩm, total 194 tại thời điểm test.
- API search thật: `phone` nhận 12/23 sản phẩm, từ khóa không khớp nhận 0.
- LDPlayer: quan sát catalog thật, mở detail, thêm cùng sản phẩm 2 lần, count 0→1→2; Cart hiển thị 2 × $9.99 = $19.98.
- LDPlayer: Reload từ menu Expo, mở Cart lại vẫn giữ quantity 2 và tổng $19.98. Chưa kiểm tra force-close hoặc APK restart.
- LDPlayer: phát hiện lỗi native notification và sửa; catalog/detail/cart phục hồi sau sửa D03.
- Firebase project `mma301-assignment2-3c064`: đã tạo bằng trình duyệt, Spark, Firestore Standard tại `asia-southeast1`, Anonymous Auth bật, rules đã publish.
- Firebase thật: Anonymous Auth PASS; ghi/đọc wishlist của chính UID PASS; UID khác đọc chéo bị `permission-denied` (PASS). Script dùng tài khoản/document test tự tạo rồi dọn chúng.
- Gemini hiện dùng `gemini-3.5-flash-lite`, thinking `minimal`. Probe schema JSON thật PASS (900 ms); 3.1-flash-lite trả 503 nên không được chọn.
- `npm run verify:cloud` PASS (2 gợi ý khớp catalog). `npm run verify:cloud -- --repeat` PASS: phone dưới $500 → 2 gợi ý (3137 ms), laptop dưới $1500 → 3 gợi ý (2286 ms), phone lần nữa → 2 gợi ý (2356 ms), từ khóa không có kết quả → 0 gợi ý (1119 ms). Cả 3 response AI khớp ID, còn hàng và nằm trong ngân sách test. Đây là kết quả tại thời điểm kiểm tra, không bảo đảm API bên ngoài luôn khả dụng.
- Lỗi lịch sử: 2.5-flash trả 404 cho user mới; 3.8-flash timeout; bản 3.8-flash-lite text không tồn tại. Không dùng các model này trong cấu hình hiện tại.
- Sau đổi Flash-Lite: regression suite 12/12 PASS (có test model mặc định/thinking/schema); `npm run verify:firebase` PASS; Gemini proxy end-to-end PASS. Android export trước đó đã PASS; UI trên LDPlayer được kiểm tra riêng.
- Metro đã khởi động lại và manifest mới tại `http://10.64.174.136:8081/` trả HTTP 200, nạp `.env`. LDPlayer vẫn hiện bundle cache cũ với cảnh báo chưa cấu hình/không kết nối Expo CLI; chưa xác nhận thành công trên UI AI. Cần kết nối lại Expo Go với Metro mới trước khi test UI. Kết quả proxy thật ở trên không bị ảnh hưởng bởi cache trên máy ảo.
- Notification permission/delivery/tap: CHƯA TEST — Expo Go hiện thiếu module; cần preview APK.
- EAS release APK/install/run không Metro: CHƯA THỰC HIỆN.

## Dependency audit

`npm audit --omit=dev` báo 9 high trong cây dependency Expo CLI/Firebase
(node-forge, zod, grpc và các package phụ thuộc). Chưa xử lý hết.
Gợi ý tự động có hạ Expo xuống 44/Firebase xuống 9, không tương thích bộ hiện tại;
không dùng `--force`. Cần kiểm tra bản vá tương thích trước release/triển khai thực tế.

## Checklist hoàn thiện trước nộp

- [ ] Điền StudentName_ClassCode/quy ước lớp vào tên project.
- [x] Cấu hình Firebase Web App + Anonymous Auth + Firestore; deploy rules; test hai UID không đọc chéo.
- [x] Cấu hình Gemini server env/model và app proxy URL; gọi API thật, kiểm tra schema/catalog/budget và fallback bằng regression tests.
- [ ] Hoàn thiện manual cases T02–T15, kèm ảnh/log không chứa key/token.
- [ ] Đăng nhập/gắn EAS project, cấu hình env preview; build/cài APK.
- [ ] Kiểm tra notification allow/deny, delivery, cold-start tap trên APK.
- [ ] Tắt Metro, chạy APK, restart giữ cart/wishlist/session.
- [ ] Ghi build URL: **chưa có**; artifact/checksum: **chưa có**; thiết bị/kết quả: **chưa có**.
- [ ] Audit code, sửa một transfer task và cập nhật AI log.

## Thứ tự đọc commit

`git log --oneline --reverse main..HEAD` hiển thị phase 1→6.
Dùng diff giữa các commit để audit; không checkout lùi trong lúc còn thay đổi chưa commit.
