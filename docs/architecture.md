# Kiến trúc và quyết định thiết kế

## Luồng và trách nhiệm

`App → providers → AppNavigator → screen → hook/context → service → API/storage`

- Screen: hiển thị dữ liệu, nhận thao tác, điều hướng.
- Hook: vòng đời request, pagination, refresh và hủy/loại kết quả request cũ.
- Context: state dùng chung (cart, Firebase session, wishlist).
- Service: giao tiếp API/Firebase/Gemini/notification; không import screen.
- Storage: đọc/ghi AsyncStorage tập trung; phục hồi trước khi cho sửa giỏ hàng.
- Domain: hàm thuần để kiểm tra dữ liệu, tính tiền và validate AI; có test độc lập.

## Decision record

| Quyết định   | Lựa chọn và lý do                                                                                        | Khi yêu cầu thay đổi                            |
| ------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Ngôn ngữ     | JavaScript theo đề; không thêm TypeScript để giảm kiến thức phải audit                                   | Có thể thêm kiểm tra kiểu sau                   |
| Navigation   | React Navigation 7 native stack, tương thích Expo Go; giữ `screens/` như đã thống nhất                   | Thêm route trong AppNavigator                   |
| State        | Context + reducer cho cart nhỏ; state request nằm trong hook                                             | Có thể thay provider mà giữ UI contract         |
| API          | DummyJSON; giá USD; service normalize/validate trước khi vào UI                                          | Thay endpoint và mapper trong service           |
| Pagination   | Server `limit/skip`; search dùng endpoint search; hủy request cũ và kiểm tra generation trước khi update | Nếu đổi API cần đổi query contract, giữ hook/UI |
| Persistence  | AsyncStorage local cart, gate hydration, tuần tự hóa ghi để tránh ghi đè dữ liệu mới bằng snapshot cũ    | Muốn sync đa thiết bị cần conflict policy       |
| Firebase     | Anonymous Auth + Firestore wishlist theo UID, rules sở hữu; không dùng collection public                 | Đăng nhập thật cần link anonymous account       |
| Gemini       | Proxy Node giữ key ở server; gửi context catalog, output JSON, map ID về catalog trước hiển thị          | Thêm use case comparison cần schema/test khác   |
| Notification | Local reminder gắn với cart; xin quyền khi người dùng bấm, đồng bộ/hủy reminder khi cart đổi             | Push từ server cần development build và backend |
| Release      | EAS preview APK; production AAB; build cần tài khoản và cấu hình môi trường thật                         | Thay package ID trước khi phát hành             |

## Giới hạn thiết kế

- Không có payment hay checkout thật; không giả tạo đơn hàng hoặc AI response.
- Anonymous UID chỉ giữ trên cùng cài đặt; gỡ app/xóa data có thể mất quyền truy cập wishlist cũ.
- Firebase/AI cần cấu hình thật. Màn hình chưa cấu hình phải báo rõ, core catalog/cart vẫn dùng được.
- Không ghi token/key vào log. Firebase web config là cấu hình client; bảo vệ dữ liệu bằng Auth/rules.
- RTM, test matrix và hướng dẫn chạy nằm trong `docs/` và README.
