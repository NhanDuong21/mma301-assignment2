# Requirement Traceability Matrix

Trạng thái đọc/ghi dịch vụ thật và release phải xem verification/test matrix; có source không đồng nghĩa đã xác minh tích hợp.

| ID | Yêu cầu | UI / code | Test và evidence |
|---|---|---|---|
| R01 | Remote products | ProductListScreen, productService, http | API smoke thật + T01/T02 |
| R02 | FlatList pagination | useProducts offset/generation/busy/end guards | dedup test + T04 cần kiểm tra cuộn trên thiết bị |
| R03 | Search + refresh | ProductListScreen debounce, useProducts reset | T05; request mới thay tập kết quả cũ |
| R04 | Detail | ProductDetailScreen, getProduct | T01 detail UI quan sát; missing ID cần manual |
| R05 | Cart | CartContext, cartReducer, CartScreen | 4 cart unit tests + T06/T07 |
| R06 | Derived totals | cartTotals, cent rounding | T06, 0/1/many assertions |
| R07 | Persistence | cartStorage, hydration gate, serialized writes | restore roundtrip tự động; restart T08 manual |
| R08 | Firebase business state | WishlistContext, firebaseService, firestore.rules | T09/T10 pending cấu hình thật |
| R09 | Notification | NotificationContext, notificationService, Settings, navigation listener | T11/T12; native-missing fallback đã quan sát; OS delivery pending APK |
| R10 | Gemini | AIScreen, aiService, server/index.cjs, recommendations validator | AI/proxy tests dùng fake upstream; T13/T14 real service pending |
| R11 | Debug | docs/debug-log.md | D01/D02 regression suite, D03 runtime LDPlayer |
| R12 | Release | app.json, eas.json, README build steps | JS export qua; T15 APK/install/run chưa thực hiện |
