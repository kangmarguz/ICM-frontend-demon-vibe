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

# 3. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p