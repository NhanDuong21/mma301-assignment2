# Verification và việc còn lại

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
- Firebase thật/Gemini thật: CHƯA TEST — chưa có config/key.
- Notification permission/delivery/tap: CHƯA TEST — Expo Go hiện thiếu module; cần preview APK.
- EAS release APK/install/run không Metro: CHƯA THỰC HIỆN.

## Dependency audit

`npm audit --omit=dev` báo 9 high trong cây dependency Expo CLI/Firebase
(node-forge, zod, grpc và các package phụ thuộc). Chưa xử lý hết.
Gợi ý tự động có hạ Expo xuống 44/Firebase xuống 9, không tương thích bộ hiện tại;
không dùng `--force`. Cần kiểm tra bản vá tương thích trước release/triển khai thực tế.

## Checklist hoàn thiện trước nộp

- [ ] Điền StudentName_ClassCode/quy ước lớp vào tên project.
- [ ] Cấu hình Firebase Web App + Anonymous Auth + Firestore; deploy rules; test hai UID không đọc chéo.
- [ ] Cấu hình Gemini server env/model/quota và app proxy URL; gọi API thật, kiểm tra trường hợp lỗi.
- [ ] Hoàn thiện manual cases T02–T15, kèm ảnh/log không chứa key/token.
- [ ] Đăng nhập/gắn EAS project, cấu hình env preview; build/cài APK.
- [ ] Kiểm tra notification allow/deny, delivery, cold-start tap trên APK.
- [ ] Tắt Metro, chạy APK, restart giữ cart/wishlist/session.
- [ ] Ghi build URL: **chưa có**; artifact/checksum: **chưa có**; thiết bị/kết quả: **chưa có**.
- [ ] Audit code, sửa một transfer task và cập nhật AI log.

## Thứ tự đọc commit

`git log --oneline --reverse main..HEAD` hiển thị phase 1→6.
Dùng diff giữa các commit để audit; không checkout lùi trong lúc còn thay đổi chưa commit.
