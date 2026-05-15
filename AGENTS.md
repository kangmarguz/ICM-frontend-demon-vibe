# Task Management Web App - Developer Guide (AGENTS.MD)

เอกสารนี้รวบรวมข้อมูลทางเทคนิค โครงสร้างโปรเจกต์ และเครื่องมือที่จำเป็นสำหรับการพัฒนา Web Application สำหรับจัดการ Task งานด้วย **React, TypeScript, Tailwind CSS** และการจัดการไฟล์ผ่าน **Cloudinary**

---

## 1. Tech Stack & Library Recommendations

เพื่อให้โปรเจกต์มีประสิทธิภาพและทันสมัย (Modern React Stack) แนะนำให้ใช้เครื่องมือดังนี้:

### Core Framework & Styling
- **Vite (React + TypeScript):** สำหรับ Build tool ที่รวดเร็วที่สุดในตอนนี้
- **Tailwind CSS:** สำหรับทำ Styling แบบ Utility-first
- **Lucide React:** ชุด Icon ที่สวยงามและเบา

### State Management & Navigation
- **Zustand:** สำหรับจัดการ Global State (ใช้งานง่ายกว่า Redux มาก)
- **React Router DOM:** สำหรับจัดการ Routing ใน Application

### Data Fetching & Forms
- **Axios:** สำหรับเรียกใช้งาน API
- **React Hook Form:** สำหรับจัดการ Form Validation
- **Zod:** สำหรับกำหนด Schema Validation (ใช้งานคู่กับ TypeScript ได้ดีเยี่ยม)

### Cloud & Media
- **Cloudinary:** สำหรับฝากไฟล์รูปภาพ/เอกสาร และทำ Image Transformation

---

## 2. การเริ่มต้นโปรเจกต์ (Installation)

```bash
# 1. Create Project with Vite
npm create vite@latest task-manager-app -- --template react-ts
cd task-manager-app

# 2. Install Dependencies
npm install axios zustand react-router-dom lucide-react react-hook-form @hookform/resolvers zod

---

## 3. Development Skills & Agents

เพื่อให้การพัฒนาโปรเจกต์นี้มีประสิทธิภาพ แนะนำให้มีทักษะและเครื่องมือต่อไปนี้:

### Required Skills
- **React & TypeScript:** ความรู้พื้นฐานในการพัฒนา Component และ Type Safety
- **Tailwind CSS:** การออกแบบ UI ด้วย Utility Classes
- **State Management:** การใช้ Zustand สำหรับจัดการ Global State
- **API Integration:** การเรียกใช้งาน REST API ด้วย Axios
- **Form Handling:** การใช้ React Hook Form และ Zod สำหรับ Validation
- **File Upload:** การจัดการไฟล์และ Cloudinary สำหรับ Media Storage

### VS Code Agents & Skills (สำหรับ AI Assistant)
- **project-setup-info-local:** สำหรับการตั้งค่าโปรเจกต์ใหม่
- **agent-customization:** สำหรับปรับแต่ง Agent และ Skill ใน VS Code
- **get-search-view-results:** สำหรับค้นหาและวิเคราะห์โค้ดในโปรเจกต์
- **debug-java-application:** สำหรับ Debug Java Application (ถ้ามีการขยาย)
- **prisma-migrate-dev:** สำหรับจัดการ Database Migration ด้วย Prisma

### Best Practices
- ใช้ TypeScript อย่างเคร่งครัดเพื่อลด Bug
- จัดการ State ด้วย Zustand แทน Redux เพื่อความเรียบง่าย
- ใช้ React Hook Form สำหรับ Form ที่ซับซ้อน
- ทดสอบโค้ดด้วย Unit Test และ Integration Test
- ใช้ Git สำหรับ Version Control และ Code Review

---

## 4. โครงสร้างโปรเจกต์ (Project Structure)

```
src/
├── components/         # UI Components
├── hooks/              # Custom Hooks
├── layouts/            # Layout Components
├── lib/                # Utilities & Helpers
├── pages/              # Page Components
├── routes/             # Routing Configuration
├── services/           # API Services
├── stores/             # State Management
├── types/              # TypeScript Types
└── styles/             # Global Styles
```

---

## 5. การพัฒนาและการ Deploy

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deployment
- Deploy ไปยัง Vercel หรือ Netlify สำหรับ Frontend
- ใช้ Cloudinary สำหรับจัดการไฟล์
- จัดการ Environment Variables สำหรับ API Keys

---

## 6. Troubleshooting

- **Build Error:** ตรวจสอบ TypeScript Errors และ Dependencies
- **API Error:** ตรวจสอบ Network และ API Endpoints
- **Styling Issue:** ตรวจสอบ Tailwind Classes และ Responsive Design
- **State Issue:** ตรวจสอบ Zustand Store และ Component Lifecycle

---

เอกสารนี้จะถูกอัปเดตตามการพัฒนาโปรเจกต์ หากมีคำถามเพิ่มเติม สามารถติดต่อทีมพัฒนาได้
