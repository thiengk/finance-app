# Requirements Document

## Introduction

Ứng dụng quản lý tài chính cá nhân giúp người dùng theo dõi chi tiêu hàng ngày, phân bổ thu nhập vào các "hũ tài chính", và lập kế hoạch tiết kiệm cho tương lai. Ứng dụng tích hợp AI để đưa ra gợi ý thông minh, giúp người dùng dễ dàng hình thành thói quen quản lý tiền bạc mà không cảm thấy phức tạp hay áp lực.

Đối tượng: Người trẻ (20-35 tuổi) muốn kiểm soát tài chính nhưng chưa có thói quen hoặc công cụ phù hợp.

## Requirements

### Requirement 1: Ghi nhận chi tiêu hàng ngày

**User Story:** As a người dùng, I want ghi lại các khoản chi tiêu nhanh chóng, so that tôi có thể theo dõi tiền đi đâu mỗi ngày.

#### Acceptance Criteria

1. WHEN người dùng mở app THEN hệ thống SHALL hiển thị nút ghi chi tiêu ở vị trí dễ thấy nhất (floating button hoặc home screen)
2. WHEN người dùng nhập khoản chi THEN hệ thống SHALL yêu cầu tối thiểu: số tiền và danh mục
3. WHEN người dùng ghi chi tiêu THEN hệ thống SHALL tự động gán ngày giờ hiện tại
4. IF người dùng không chọn danh mục THEN hệ thống SHALL gợi ý danh mục dựa trên mô tả (AI)
5. WHEN người dùng hoàn tất ghi chi tiêu THEN hệ thống SHALL cập nhật tổng chi tiêu ngày/tuần/tháng ngay lập tức

### Requirement 2: Quản lý hũ tài chính

**User Story:** As a người dùng, I want phân bổ thu nhập vào các hũ tài chính theo tỷ lệ tùy chỉnh, so that tôi có thể kiểm soát ngân sách cho từng mục đích.

#### Acceptance Criteria

1. WHEN người dùng thiết lập hũ tài chính THEN hệ thống SHALL cho phép tạo nhiều hũ với tên và tỷ lệ phần trăm tùy chỉnh
2. WHEN tổng tỷ lệ các hũ vượt quá 100% THEN hệ thống SHALL cảnh báo và không cho lưu
3. WHEN người dùng nhập thu nhập THEN hệ thống SHALL tự động phân bổ vào các hũ theo tỷ lệ đã cài đặt
4. WHEN người dùng chi tiêu từ một hũ THEN hệ thống SHALL trừ số dư của hũ tương ứng
5. IF số dư hũ sắp hết (dưới 10%) THEN hệ thống SHALL gửi cảnh báo cho người dùng

### Requirement 3: Kế hoạch tiết kiệm

**User Story:** As a người dùng, I want tạo mục tiêu tiết kiệm với thời hạn cụ thể, so that tôi có động lực và lộ trình rõ ràng để đạt mục tiêu tài chính.

#### Acceptance Criteria

1. WHEN người dùng tạo mục tiêu tiết kiệm THEN hệ thống SHALL yêu cầu: tên mục tiêu, số tiền mục tiêu, và thời hạn
2. WHEN mục tiêu được tạo THEN hệ thống SHALL tính toán số tiền cần tiết kiệm mỗi tháng/tuần
3. WHEN người dùng nạp tiền vào mục tiêu THEN hệ thống SHALL cập nhật tiến độ và hiển thị phần trăm hoàn thành
4. IF người dùng không nạp tiền đúng lịch THEN hệ thống SHALL gửi nhắc nhở nhẹ nhàng
5. WHEN người dùng đạt mục tiêu THEN hệ thống SHALL hiển thị thông báo chúc mừng

### Requirement 4: Báo cáo và thống kê

**User Story:** As a người dùng, I want xem báo cáo chi tiêu trực quan, so that tôi hiểu rõ thói quen tài chính của mình.

#### Acceptance Criteria

1. WHEN người dùng mở mục báo cáo THEN hệ thống SHALL hiển thị biểu đồ chi tiêu theo danh mục (pie chart) và theo thời gian (line chart)
2. WHEN người dùng chọn khoảng thời gian THEN hệ thống SHALL lọc dữ liệu theo ngày/tuần/tháng/năm
3. WHEN kết thúc tháng THEN hệ thống SHALL tạo báo cáo tổng kết tự động
4. WHEN người dùng xem báo cáo THEN hệ thống SHALL so sánh với tháng trước và highlight thay đổi đáng chú ý

### Requirement 5: Tích hợp AI thông minh

**User Story:** As a người dùng, I want nhận gợi ý tài chính thông minh từ AI, so that tôi có thể cải thiện thói quen chi tiêu mà không cần tự phân tích.

#### Acceptance Criteria

1. WHEN người dùng có đủ dữ liệu chi tiêu (ít nhất 1 tuần) THEN hệ thống SHALL phân tích và đưa ra insight về thói quen chi tiêu
2. WHEN phát hiện chi tiêu bất thường (cao hơn 50% so với trung bình) THEN hệ thống SHALL thông báo cho người dùng
3. WHEN người dùng hỏi bằng ngôn ngữ tự nhiên (ví dụ: "tháng này tôi tiêu bao nhiêu cho ăn uống?") THEN hệ thống SHALL trả lời chính xác
4. WHEN bắt đầu tháng mới THEN hệ thống SHALL đề xuất ngân sách dựa trên lịch sử chi tiêu
5. IF người dùng nhập mô tả chi tiêu THEN hệ thống SHALL tự động phân loại danh mục bằng AI

### Requirement 6: Trải nghiệm người dùng thân thiện

**User Story:** As a người dùng, I want giao diện đơn giản và thao tác nhanh, so that tôi không cảm thấy phiền khi phải ghi chép tài chính mỗi ngày.

#### Acceptance Criteria

1. WHEN người dùng mở app THEN hệ thống SHALL hiển thị dashboard tổng quan trong vòng 2 giây
2. WHEN người dùng ghi chi tiêu THEN hệ thống SHALL hoàn tất trong tối đa 3 thao tác (tap)
3. WHEN người dùng sử dụng app lần đầu THEN hệ thống SHALL hiển thị onboarding ngắn gọn (tối đa 3 màn hình)
4. WHEN người dùng đạt milestone (ví dụ: ghi chép 7 ngày liên tiếp) THEN hệ thống SHALL hiển thị badge/achievement để tạo động lực
5. IF người dùng không mở app trong 2 ngày THEN hệ thống SHALL gửi push notification nhắc nhở nhẹ nhàng
