# KAPI Frontend - React + TypeScript + Vite

Modern React frontend application for KAPI (Smart Access Control System).

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Redux Toolkit** - Global state management
- **React Query (TanStack Query)** - Server state management and caching
- **Axios** - HTTP client
- **React Hook Form** - Form management

## 📁 Project Structure

```
src/
├── api/                    # API client and interceptors
├── assets/                 # Static files
├── components/             # Shared UI components (Atomic Design)
│   ├── atoms/              # Basic UI elements
│   ├── molecules/          # Simple component compositions
│   ├── organisms/          # Complex components
│   └── templates/          # Page templates
├── features/               # Feature-based modules
│   └── auth/               # Authentication feature
│       ├── api/            # Auth API calls
│       └── components/     # Auth-specific components
├── hooks/                  # Custom React hooks
├── layouts/                # Page layouts
├── services/               # Business logic services
├── store/                  # Redux store and slices
│   ├── slices/             # Redux slices
│   └── hooks.ts            # Typed Redux hooks
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── App.tsx                 # Main application component
└── main.tsx                # Application entry point
```

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   # Copy from .env.example
   VITE_API_URL=http://localhost:3005/v1.0
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔑 Features

### Authentication
- ✅ **Login** - User login with email/password
- ✅ **Sign Up** - New user registration with validation
- ✅ **Protected Routes** - Automatic redirection for unauthenticated users
- ✅ **Token Management** - Automatic token storage and injection

### API Integration
- ✅ **Axios Interceptors** - Automatic token injection and error handling
- ✅ **React Query** - Data fetching, caching, and synchronization
- ✅ **Global Error Handling** - 401 redirect, network error management

### State Management
- ✅ **Redux Toolkit** - Global auth state management
- ✅ **LocalStorage Persistence** - Token persistence across sessions

### UI/UX
- ✅ **TailwindCSS** - Responsive, modern design
- ✅ **Form Validation** - Real-time validation with React Hook Form
- ✅ **Loading States** - User feedback during async operations

## 📡 API Endpoints

- `POST /auth/sign-up` - Create new account
- `POST /auth/login` - User login
- `POST /auth/account/verify` - Verify account with OTP

## 🎨 Design Patterns

- **Feature-Based Architecture** - Code organized by features
- **Atomic Design** - UI components hierarchy (atoms → molecules → organisms → templates)
- **Custom Hooks** - Reusable logic extraction
- **TypeScript Strict Mode** - Type safety throughout

## 🔐 Environment Variables

```env
VITE_API_URL=http://localhost:3005/v1.0  # Backend API base URL
```

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint (if configured)
```

## 📝 Notes

- **Backend URL:** Make sure backend is running on `http://localhost:3005`
- **.env File:** Not tracked in git, create it manually from `.env.example`
- **Token Storage:** Access and refresh tokens stored in localStorage
- **Protected Routes:** Automatically redirect to `/auth/login` if not authenticated

## 🚧 TODO

- [ ] Add account verification page (OTP)
- [ ] Implement refresh token logic
- [ ] Add logout functionality
- [ ] Create user profile page
- [ ] Add error toast notifications
- [ ] Add loading skeleton screens
- [ ] Implement remember me functionality
- [ ] Add password reset flow

## 📄 License

Proprietary - KAPI Project
