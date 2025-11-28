# Tasker Frontend

Modern Next.js frontend for the Tasker API.

## 🚀 Features

- **Authentication**: Login and Register with JWT
- **Dashboard**: View and manage all your boards
- **Kanban Board**: Drag-and-drop tasks between columns
- **Task Management**: Create, edit, move, and delete tasks
- **Comments**: Discuss tasks with your team
- **Search**: Global task search
- **Collaboration**: Manage board members and roles

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🏃‍♂️ Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Update `NEXT_PUBLIC_API_URL` if your backend is not running on port 8080.

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

- `/app` - Pages and layouts (App Router)
- `/components` - Reusable UI components
- `/lib` - Utilities, API client, hooks
- `/store` - Global state (Zustand)
- `/types` - TypeScript definitions

## 🔐 Authentication

The app uses JWT authentication. Tokens are stored in `localStorage` and automatically attached to API requests via Axios interceptors.
