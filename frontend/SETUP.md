# StageBloom Frontend Setup Guide

## 🧑‍💻 Tech Stack
- **Framework**: Next.js 15.2.4 (React 18+)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Context API
- **Forms**: React Hook Form, Zod
- **Charts**: Recharts 2.15.0
- **Animations**: Framer Motion 12.20.1
- **Notifications**: Sonner 1.7.1
- **Security**: Input sanitization, CSRF, XSS, JWT, environment variables
- **Performance**: Code splitting, lazy loading, memoization, image optimization
- **Testing**: Jest, React Testing Library
- **Linting/Formatting**: ESLint, Prettier

## Environment Variables Setup

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Required Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=StageBloom

# Optional Environment Variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0

# Security (Optional)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Analytics and Monitoring (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# External Services (Optional)
GOOGLE_SITE_VERIFICATION=your-google-verification-code
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy the example above to `.env.local`
   - Update the values as needed

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Configuration

If you don't set up the `.env.local` file, the application will use these defaults:

- `NEXT_PUBLIC_API_URL`: `http://localhost:8000/api`
- `NEXT_PUBLIC_APP_NAME`: `StageBloom`
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`
- `NEXT_PUBLIC_APP_VERSION`: `1.0.0`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run security:audit` - Run security audit
- `npm run analyze` - Analyze bundle size

## Troubleshooting

### Environment Variables Error
If you see an error about missing environment variables, make sure you have created the `.env.local` file with the required variables.

### API Connection Error
Make sure your backend server is running on the URL specified in `NEXT_PUBLIC_API_URL`.

### Build Errors
Run `npm run lint` to check for code quality issues and `npm run type-check` to verify TypeScript types. 