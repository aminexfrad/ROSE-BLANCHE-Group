# StageBloom Frontend

A modern, secure, and high-performance web application built with Next.js 15, TypeScript, and Tailwind CSS for managing internship programs and student placements.

## 🚀 Features

- **Modern UI/UX**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with custom hooks for mobile detection
- **Authentication**: JWT-based authentication with protected routes
- **Role-based Access**: Different dashboards for Admin, RH, Tuteur, and Stagiaire
- **Real-time Notifications**: Toast notifications with Sonner
- **File Upload**: Drag-and-drop file upload functionality with security validation
- **Charts & Analytics**: Interactive charts with Recharts
- **Dark/Light Mode**: Theme switching with next-themes
- **Form Validation**: React Hook Form with Zod validation
- **Animations**: Smooth animations with Framer Motion
- **Security**: Comprehensive security measures including input sanitization, CSRF protection, and rate limiting
- **Performance**: Optimized for speed with code splitting, lazy loading, and image optimization

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts 2.15.0
- **Animations**: Framer Motion 12.20.1
- **Notifications**: Sonner 1.7.1
- **Icons**: Lucide React 0.454.0
- **Security**: Custom security utilities with input sanitization and validation

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 13+ app directory
│   ├── admin/             # Admin dashboard pages
│   ├── login/             # Authentication pages
│   ├── notifications/     # Notification management
│   ├── profile/           # User profile pages
│   ├── public/            # Public pages (landing, contact)
│   ├── rh/                # RH (HR) dashboard pages
│   ├── stagiaire/         # Intern dashboard pages
│   └── tuteur/            # Tutor dashboard pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── error-boundary.tsx # Error handling component
│   └── ...               # Custom components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API
│   ├── api.ts           # API client with security
│   ├── security.ts      # Security utilities
│   ├── env.ts           # Environment configuration
│   └── utils.ts         # General utilities
└── public/               # Static assets
```

## 🔐 Security Features

### Input Validation & Sanitization
- **Zod Schemas**: Comprehensive validation for all forms
- **Input Sanitization**: Automatic removal of potentially dangerous content
- **File Validation**: Strict file type and size validation
- **XSS Prevention**: Proper escaping and sanitization of user inputs

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permissions for different user types
- **Session Management**: Automatic token refresh and session timeout
- **Rate Limiting**: Protection against brute force attacks

### CSRF Protection
- **CSRF Tokens**: Generated and validated for sensitive operations
- **SameSite Cookies**: Proper cookie configuration
- **Request Validation**: Verification of request origins

### Security Headers
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME type sniffing
- **Referrer-Policy**: Control referrer information
- **X-XSS-Protection**: Additional XSS protection

## ⚡ Performance Optimizations

### Next.js Optimizations
- **Image Optimization**: Automatic image compression and format conversion
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Compression**: Gzip compression enabled
- **Caching**: Optimized caching strategies

### Frontend Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large lists and tables
- **Debouncing**: Input handlers optimized with debouncing
- **Error Boundaries**: Graceful error handling

### Build Optimizations
- **Tree Shaking**: Unused code elimination
- **Minification**: Code and CSS minification
- **Source Maps**: Development-friendly debugging
- **Bundle Splitting**: Vendor and app code separation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StageBloom/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the frontend directory:
   ```env
   # Required
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME=StageBloom
   
   # Optional
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_GA_ID=your-ga-id
   GOOGLE_SITE_VERIFICATION=your-verification-code
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

### Code Quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Security
- `npm run security:audit` - Run security audit
- `npm run security:fix` - Fix security vulnerabilities

### Performance
- `npm run analyze` - Analyze bundle size
- `npm run clean` - Clean build artifacts

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | - |
| `NEXT_PUBLIC_APP_NAME` | Application name | Yes | - |
| `NEXT_PUBLIC_APP_URL` | Application URL | No | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | No | `1.0.0` |
| `NEXTAUTH_SECRET` | Authentication secret | No | - |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No | - |
| `GOOGLE_SITE_VERIFICATION` | Google site verification | No | - |

### Security Configuration

The application includes comprehensive security features:

```typescript
// Security settings in lib/env.ts
export const security = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  passwordRequirements: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
}
```

### Performance Configuration

```typescript
// API settings in lib/env.ts
export const api = {
  baseUrl: env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
}
```

## 🎨 UI Components

The project uses a comprehensive set of UI components built on top of Radix UI:

- **Layout**: Sidebar, Navigation, Dashboard Layout
- **Forms**: Input, Select, Checkbox, Radio, Textarea with validation
- **Feedback**: Toast, Alert, Progress, Skeleton
- **Data Display**: Table, Card, Badge, Avatar
- **Navigation**: Breadcrumb, Tabs, Pagination
- **Overlay**: Dialog, Popover, Tooltip, Sheet

## 🔐 Authentication

The app implements JWT-based authentication with the following features:

- Protected routes for different user roles
- Automatic token refresh
- Persistent login state
- Role-based access control
- Rate limiting for login attempts
- Session timeout management

### User Roles

- **Admin**: Full system access and management
- **RH (HR)**: Internship request management and reporting
- **Tuteur**: Intern supervision and evaluation
- **Stagiaire**: Intern dashboard and document management

## 📊 Dashboard Features

### Admin Dashboard
- System configuration
- User management
- Database monitoring
- Security settings
- Global statistics

### RH Dashboard
- Internship request management
- KPI tracking
- Reports generation
- Intern management
- Testimonials

### Tuteur Dashboard
- Intern supervision
- Evaluation management
- Planning tools
- Communication tools
- Statistics

### Stagiaire Dashboard
- Document management
- KPI tracking
- Progress tracking
- Testimonials

## 🎯 Key Features

### File Upload
- Drag-and-drop interface
- Multiple file support
- Progress tracking
- File validation and sanitization
- Secure file handling

### Notifications
- Real-time toast notifications
- Persistent notification center
- Email notifications (via backend)
- Rate-limited notifications

### Charts & Analytics
- Interactive charts with Recharts
- KPI dashboards
- Data visualization
- Export capabilities

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

Ensure all environment variables are properly configured for your production environment.

### Security Checklist

- [ ] All environment variables are set
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Rate limiting is active
- [ ] Input validation is working
- [ ] File upload restrictions are in place
- [ ] Error handling is comprehensive

### Performance Checklist

- [ ] Images are optimized
- [ ] Code splitting is working
- [ ] Bundle size is reasonable
- [ ] Caching is configured
- [ ] Compression is enabled
- [ ] Error boundaries are in place

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run security and performance checks
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use proper error handling
- Implement security measures
- Optimize for performance
- Write comprehensive tests
- Follow the established code style

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔒 Security

If you discover a security vulnerability, please report it to the development team immediately. Do not disclose it publicly until it has been addressed.

## 📈 Performance Monitoring

The application includes performance monitoring capabilities:

- Bundle size analysis
- Runtime performance tracking
- Error reporting (when configured)
- User experience metrics

## 🧪 Testing

The project includes comprehensive testing setup:

- Unit tests with Jest
- Component testing with React Testing Library
- Integration tests for critical flows
- Security testing for forms and API calls 