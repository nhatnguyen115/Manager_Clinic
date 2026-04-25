# ClinicPro - Hệ thống Quản lý Phòng khám Thông minh

## 📄 Giới thiệu
ClinicPro là một hệ thống quản lý phòng khám toàn diện, được thiết kế để chuẩn hóa quy trình tiếp nhận, khám bệnh, quản lý hồ sơ y tế và tương tác giữa Bác sĩ - Bệnh nhân - Quản trị viên.

## 🚀 Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.2 (Java 21)
- **Security:** Spring Security + JWT
- **Database:** PostgreSQL 18.1
- **Migration:** Flyway
- **API Documentation:** Swagger/OpenAPI
- **Storage:** Cloudinary (User Avatars/Medical Attachments)

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State/Routing:** React Router 6/7
- **Visualization:** Recharts (Admin Dashboard)

## 📁 Cấu trúc thư mục
- `backend/`: Mã nguồn Spring Boot
- `frontend/`: Mã nguồn React app
- `docs/`: Tài liệu thiết kế (BRIEF, DESIGN)
- `plans/`: Kế hoạch chi tiết theo phase
- `.brain/`: Bộ nhớ vĩnh viễn của AI (brain.json, session.json)

## 🛠️ Hướng dẫn cài đặt

### Backend
1. Yêu cầu: Java 21, Docker (hoặc PostgreSQL local).
2. Config `application.yml` hoặc `.env`.
3. Chạy lệnh: `./mvnw spring-boot:run`

### Frontend
1. Yêu cầu: Node.js 18+.
2. Cài đặt dependency: `npm install`
3. Chạy dev server: `npm run dev`

## 📖 Lịch sử thay đổi
Xem chi tiết tại [CHANGELOG.md](./CHANGELOG.md).

---
*Dự án đang trong giai đoạn phát triển Phase 09 (Thanh toán).*
# Manager_Clinic
