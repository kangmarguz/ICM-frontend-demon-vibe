# ISM Vibe Client

Frontend web application สำหรับจัดการ project workspace สร้างด้วย React, TypeScript, Vite และ Tailwind CSS โดยเชื่อมต่อ backend API สำหรับ login, โหลด project, สร้าง/แก้ไข project และอัปโหลดรูปผ่าน Cloudinary

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Zustand
- Axios
- React Hook Form + Zod
- Lucide React
- Motion

## Features

- Login ด้วย email/password และเก็บ session ด้วย Zustand persist + localStorage
- Protected routes สำหรับหน้า workspace
- Role-based project visibility
  - `ADMIN` เห็น project ทั้งหมด
  - `USER` เห็น project ที่ตัวเองสร้าง
  - `GUEST` เห็น project ของ owner ที่ถูก assign
- Dashboard แสดงจำนวน project และ image ที่มองเห็นได้
- Project list พร้อม loading/error state
- Add project พร้อม upload image แยกประเภท
  - `IMAGE_2D`
  - `IMAGE_3D`
  - `PAY_SLIP`
- Project detail สำหรับดู/แก้ไขข้อมูล project
- Upload image เพิ่มใน project detail
- Delete image จาก Cloudinary ด้วย `publicId`
- Resize image ฝั่ง client เป็น base64 ก่อนส่งเข้า upload API

## Prerequisites

- Node.js 18+
- npm
- Backend API ที่รองรับ endpoint ตาม section `API Endpoints`

## Installation

```bash
npm install
```

สร้างไฟล์ `.env` ที่ root ของ client ถ้าต้องการเปลี่ยน API base URL:

```env
VITE_API_BASE_URL=http://localhost:3333/api
```

ถ้าไม่กำหนด env แอปจะใช้ค่า default:

```txt
http://localhost:3333/api
```

## Scripts

```bash
npm run dev
```

รัน development server

```bash
npm run build
```

ตรวจ TypeScript และ build production

```bash
npm run preview
```

preview production build

```bash
npm run lint
```

รัน ESLint

## Project Structure

```txt
src/
  components/       Reusable UI components
  hooks/            Custom hooks เช่น useLoadProjects
  layouts/          Layout หลักของ protected workspace
  lib/              Shared utilities และ apiClient
  pages/            Route pages
  routes/           Router และ ProtectedRoute
  services/         API service layer
  stores/           Zustand stores
  styles/           Tailwind/global CSS
  types/            Shared TypeScript types
```

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/login` | Login | Public |
| `/` | Home dashboard | Protected |
| `/projects` | Project list | Protected |
| `/projects/new` | Add project | Protected |
| `/projects/:projectId` | Project detail | Protected |
| `/users` | Current user info | Protected |
| `/settings` | Settings placeholder | Protected |

## State Management

### Auth Store

ไฟล์: `src/stores/authStore.ts`

เก็บข้อมูล:

- `user`
- `token`

Actions:

- `actionSetUser`
- `actionSetToken`
- `actionSetSession`
- `actionClearAuth`
- `actionLogout`

token ถูกเก็บใน localStorage ด้วย key:

```txt
auth_token
```

และ `apiClient` จะนำ token ไปใส่ใน header:

```txt
Authorization: Bearer <token>
```

### Project Store

ไฟล์: `src/stores/projectStore.ts`

เก็บข้อมูล:

- `projects`

Actions:

- `actionSetProjects`
- `actionAddProject`
- `actionUpdateProject`
- `createProject`

มี helper:

- `getVisibleProjects(projects, user)` สำหรับกรอง project ตาม role

## API Endpoints

API base URL ถูกตั้งใน `src/lib/apiClient.ts`

### Auth

```http
POST /login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response รองรับได้ทั้ง:

```json
{
  "message": "Login success",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

หรือ:

```json
{
  "data": {
    "token": "jwt-token",
    "user": {}
  }
}
```

### Projects

```http
GET /projects
```

ใช้สำหรับ `ADMIN`

```http
GET /users/:userId/projects
```

ใช้สำหรับ `USER` และ `GUEST`

```http
GET /projects/:projectId
```

โหลดรายละเอียด project

```http
POST /projects
```

สร้าง project

```http
PATCH /projects/:projectId
```

แก้ไข project หรือเพิ่ม images เข้า project

### Uploads

```http
POST /uploads/cloudinary
```

Request:

```json
{
  "name": "image.jpg",
  "file": "data:image/jpeg;base64,...",
  "type": "IMAGE_2D"
}
```

Response:

```json
{
  "asset": {
    "name": "image.jpg",
    "url": "https://res.cloudinary.com/...",
    "publicId": "cloudinary-public-id"
  }
}
```

```http
DELETE /uploads/cloudinary
```

Request body:

```json
{
  "publicId": "cloudinary-public-id"
}
```

## Core Types

### Role

```ts
type Role = 'USER' | 'GUEST' | 'ADMIN';
```

### ProjectStatus

```ts
type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
```

### ImageType

```ts
type ImageType = 'IMAGE_2D' | 'IMAGE_3D' | 'PAY_SLIP';
```

## Image Upload Flow

1. User เลือกรูปจาก form หรือ drag and drop
2. `resizeImageToBase64` ย่อรูปด้วย canvas และแปลงเป็น base64
3. `uploadToCloudinary` ส่ง base64 ไปที่ backend
4. backend upload ไป Cloudinary แล้วส่ง `asset` กลับมา
5. frontend ส่งข้อมูล image ที่ upload แล้วเข้า project API

## Development Notes

- Service layer อยู่ใน `src/services`
- ถ้า backend response เปลี่ยน ควรปรับ normalizer ใน service layer แทนการแก้ใน component
- Form validation อยู่ที่ `src/components/projects/projectFormSchema.ts`
- Protected route ใช้ `user` จาก auth store เป็นตัวตัดสินว่าเข้า workspace ได้หรือไม่
- Project detail ใช้ cache จาก Zustand ก่อน แล้วค่อย fetch ข้อมูลล่าสุดจาก API
