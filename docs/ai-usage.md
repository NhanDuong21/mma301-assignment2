# AI usage log

Đây là bản ghi **AI đã hỗ trợ phần lớn implementation**. Sinh viên chưa audit thì không được coi đã làm chủ code.

| Task / prompt reference | Mục đích | Output áp dụng | Chỉnh sửa / kiểm chứng |
|---|---|---|---|
| Chat: tóm tắt Assignment 2 | Hiểu phạm vi | Tóm tắt yêu cầu PDF | Đối chiếu R01–R12 trong RTM; sinh viên đọc lại PDF |
| Chat: khởi tạo Expo từng bước | Tạo nền project | Blank JavaScript template, README | Export/Doctor; sinh viên đã mở màn hình mặc định LDPlayer |
| Chat: gen theo phase, commit để audit | Tạo implementation để review | Navigation, API/hook, cart/storage, Firebase, proxy Gemini, notification, tests/docs | Export mỗi phase; automated tests; runtime catalog/detail/cart trên LDPlayer |
| Test và runtime debug | Không tin code sinh ra khi chưa chạy | Sửa server syntax, kiểm tra stock AI, native notification fallback | Tham khảo debug-log và verification; external integration vẫn pending |
| Chat: dùng màn hình tạo Firebase trên tài khoản được chỉ định | Cấu hình dịch vụ thật | Firebase Spark, Web App, Anonymous Auth, Firestore/rules; dùng Gemini key có sẵn | Config lưu trong .env bị ignore; live Firebase write/read/cross-UID-denial đã chạy; Gemini proxy kiểm tra riêng |

## Sinh viên audit lần lượt

- [ ] Chạy app ở từng commit phase và giải thích thay đổi.
- [ ] API → service → hook → FlatList; query mới hủy request cũ thế nào?
- [ ] Cart reducer → totals → AsyncStorage; vì sao đợi hydration và ghi tuần tự?
- [ ] UID → path wishlist → rules; vì sao người khác không đọc được wishlist?
- [ ] Gemini token/auth → catalog → prompt/schema → validation → UI; vì sao không tin ID AI?
- [ ] Permission → schedule → thay cart/cancel → tap navigation; vì sao Expo Go có thể thiếu module?
- [ ] Tự thực hiện ít nhất 1 thay đổi nhỏ, ví dụ sort giá, và thêm test phù hợp.
- [ ] Tự chạy manual matrix và bổ sung kết quả thật.
- [ ] Tự giải thích D01/D02/D03, không chỉ đọc lại mô tả.

Phần nào đã tự sửa, phần output nào từ chối và cách kiểm chứng cần bổ sung vào log trong lúc audit.
Không nộp bản này như một cam kết đã hiểu toàn bộ khi các checkbox còn trống.
