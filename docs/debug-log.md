# Debug log thực tế — 2026-10-27

Các lỗi dưới đây được phát hiện và sửa trong quá trình triển khai bằng Codex.
Đây là bằng chứng kiểm tra trên máy phát triển, chưa thay thế phần giải thích/debug trực tiếp của sinh viên.

## D01 — Proxy không khởi động được dù Android bundle thành công

- Triệu chứng: `node --test tests/*.test.cjs` dừng ở `SyntaxError: Unexpected token ']'`, `server/index.cjs`, trường `contents`.
- Giả thuyết: payload Gemini thiếu dấu đóng object ở `parts`; Metro chỉ đóng gói app nên không parse server.
- Cách kiểm tra: đọc vị trí stack trace, chạy `node --check server/index.cjs`.
- Root cause: thiếu `}` sau biểu thức `JSON.stringify(...)` của `{ text: ... }`.
- Fix: đóng object `text` trước khi đóng mảng `parts`.
- Retest: syntax check thành công; các integration test proxy đã chạy được. Bộ kiểm tra cuối chạy toàn bộ tests.
- Bài học: Android export không kiểm chứng mã server; cần kiểm tra server riêng.

## D02 — AI vẫn có thể gợi ý sản phẩm hết hàng

- Triệu chứng: test `AI boundary rejects ... unavailable stock` báo `Missing expected exception`, 9/10 tests qua.
- Giả thuyết: prompt yêu cầu còn hàng nhưng runtime validator chỉ kiểm tra ID/reason.
- Cách kiểm tra: đưa output có ID hợp lệ nhưng catalog ghi `stock: 0` vào `validateRecommendations`.
- Root cause: thiếu điều kiện tồn kho trong validation. Chỉ dẫn trong prompt không phải ràng buộc chắc chắn.
- Fix: từ chối cả kết quả nếu một sản phẩm được gợi ý có `stock < 1`; validator dùng chung cho proxy và app.
- Retest: test tồn kho và toàn bộ regression suite được chạy lại sau fix.
- Bài học: output AI phải qua validation nghiệp vụ bên cạnh kiểm tra schema/ID.

## D03 — Native notification làm app crash trong Expo Go cũ

- Triệu chứng trên LDPlayer: `Cannot find native module 'ExpoTopicSubscriptionModule'` ngay lúc mở app; Android JS export và Expo Doctor vẫn qua.
- Giả thuyết: binary Expo Go cũ không có module native của patch expo-notifications đã cài.
- Kiểm tra: screenshot runtime + tìm `TopicSubscriptionModule.android.ts` trong dependency.
- Root cause: import `expo-notifications` ở top level kéo native module bắt buộc vào trước khi UI render.
- Fix: kiểm tra `requireOptionalNativeModule` trước khi require thư viện; native boundary lazy,
  permission bật thông báo báo lỗi rõ nếu thiếu; navigation listener dùng no-op khi unavailable.
  Chỉ thêm try/catch quanh require chưa đủ vì Metro vẫn hiện lỗi module đã evaluate;
  phải tránh evaluate khi native module không có.
- Retest thực tế: LDPlayer hiển thị catalog, mở detail và thêm item; không còn màn hình lỗi.
- Giới hạn: chưa xác minh delivery notification; cần binary preview có plugin/native module.

## D04 — Key hợp lệ không đồng nghĩa model/luồng tư vấn đã hoạt động

- Kiểm tra dịch vụ thật: ListModels trả 200, nhưng generateContent với 2.5-flash trả 404, thông báo không còn nhận người dùng mới.
- Đổi sang model 3.8-flash theo phản hồi API; lời gọi đơn giản trả 200. Schema/catalog request qua proxy lại timeout; một model nhẹ hơn trả 503 và một model lite được list nhưng không truy cập được (404).
- Điều chỉnh: model cấu hình ở server env, thinking low cho Gemini 3, giới hạn output, timeout rõ ràng, app có nút Hủy; proxy trả HTTP 504 cho timeout thay vì lỗi chung.
- Retest: live Firebase vẫn PASS; test timeout 504 tự động PASS. End-to-end Gemini tư vấn **chưa PASS**, cần thử lại khi dịch vụ/model khả dụng ổn định. Không ghi nhận thành công giả.

### D04 — Retest sau khi chuyển Flash-Lite

- Chọn từ ListModels thực tế và probe generateContent: 3.5-flash-lite trả HTTP 200 + JSON hợp lệ trong 900 ms; 3.1-flash-lite trả 503.
- Fix cấu hình: mặc định/env dùng `gemini-3.5-flash-lite`, thinking `minimal`; không suy đoán tên model từ phiên bản mới hơn.
- Retest `verify:cloud` PASS; `verify:cloud -- --repeat` PASS 3 lời gọi tư vấn thật (phone/laptop/phone) và 1 case catalog không có kết quả. Các gợi ý khớp ID, tồn kho, ngân sách. Luồng proxy end-to-end hiện đã PASS.
