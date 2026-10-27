# Test matrix

Ngày: 2026-10-27. Không ghi PASS cho những case chưa chạy.
`AUTO` là test logic/proxy giả lập; `UI` là quan sát trên LDPlayer; cả hai không thay thế cloud/release thật.

| # | Nhóm/case | Thao tác và expected | Actual / trạng thái |
|---|---|---|---|
| T01 | API success / detail | Load catalog → mở item → ảnh/tên/giá/mô tả đúng | PASS API smoke thật và quan sát catalog/detail LDPlayer |
| T02 | Network error | Ngắt mạng → refresh → error/retry; mở mạng → retry thành công | PENDING manual; timeout/error path đã có source |
| T03 | Empty list | Search chuỗi không khớp → empty state; xóa query phục hồi | PENDING manual |
| T04 | Pagination end | Cuộn hết; không duplicate, không request vô hạn; search/reset trong lúc tải | AUTO dedup PASS; PENDING UI/end/concurrency |
| T05 | Search hit/miss/refresh | phone có kết quả, chuỗi vô nghĩa không có; refresh giữ query | PENDING UI; API smoke search sẽ được ghi trong verification |
| T06 | Cart add same item | Thêm cùng sản phẩm 2 lần → 1 dòng quantity 2, count/total đúng | AUTO PASS; UI detail count đổi 0→1→2 và Cart tổng $19.98 |
| T07 | Quantity zero/remove | Giảm về 0/xóa → loại item; không vượt stock; 0/1/many totals | AUTO PASS; PENDING UI các thao tác remove |
| T08 | Persistence restart | Có giỏ → reload/force close/open → giỏ giữ nguyên; không bị giỏ rỗng ghi đè | AUTO roundtrip PASS; UI reload PASS (quantity 2, $19.98); PENDING force-close/APK restart |
| T09 | Firebase write/read | Save detail → Firestore document theo UID → refresh wishlist → đúng data | PENDING Firebase config/rules deployment |
| T10 | Firebase error | Deny rules/ngắt mạng → báo lỗi, không ghi success giả, core cart dùng được | PENDING dịch vụ thật; timeout/error handling đã triển khai |
| T11 | Notification denied | Từ chối quyền → phản hồi rõ, không crash, catalog/cart dùng được | PENDING OS permission; fallback thiếu native module đã kiểm tra |
| T12 | Notification event | Bật khi cart có hàng → 60s nhận → tap mở cart; đổi cart update; rỗng/tắt cancel | PENDING preview APK/native module trên thiết bị |
| T13 | Gemini valid | Cấu hình proxy → nhu cầu + catalog → response mapped; giá từ API | AUTO proxy/schema mapping PASS bằng fake upstream; PENDING Gemini thật |
| T14 | AI error/invalid | ID giả, trùng, stock0, sai JSON, timeout/quota → không action/render sai | AUTO boundary/invalid proxy PASS; PENDING cloud timeout/quota UI |
| T15 | Release install/run | Build APK → cài → tắt Metro → chạy workflow + restart | PENDING EAS account/build/APK/install |

## Ghi kết quả manual tiếp theo

Mỗi case ghi: phiên bản/commit, thiết bị/OS, các bước, expected, actual, screenshot/log (không chứa secret), bug liên quan, retest.
