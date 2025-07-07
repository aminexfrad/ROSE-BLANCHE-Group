# StageBloom Frontend

A modern, responsive web application built with Next.js 15, TypeScript, and Tailwind CSS for managing internship programs and student placements.

## 🚀 Features

- **Modern UI/UX**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with custom hooks for mobile detection
- **Authentication**: JWT-based authentication with protected routes
- **Role-based Access**: Different dashboards for Admin, RH, Tuteur, and Stagiaire
- **Real-time Notifications**: Toast notifications with Sonner
- **File Upload**: Drag-and-drop file upload functionality
- **Charts & Analytics**: Interactive charts with Recharts
- **Dark/Light Mode**: Theme switching with next-themes
- **Form Validation**: React Hook Form with Zod validation
- **Animations**: Smooth animations with Framer Motion

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
│   └── ...               # Custom components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API
└── public/               # Static assets
```

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
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME=StageBloom
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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 UI Components

The project uses a comprehensive set of UI components built on top of Radix UI:

- **Layout**: Sidebar, Navigation, Dashboard Layout
- **Forms**: Input, Select, Checkbox, Radio, Textarea
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
- File validation

### Notifications
- Real-time toast notifications
- Persistent notification center
- Email notifications (via backend)

### Charts & Analytics
- Interactive charts with Recharts
- KPI dashboards
- Data visualization
- Export capabilities

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `StageBloom` |

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Custom color palette
- Animation utilities
- Responsive breakpoints
- Component variants

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

Ensure all environment variables are properly configured for your production environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

## 🔗 Related Links

- [Backend API Documentation](../backend/README.md)
- [Project Overview](../README.md)
- [API Documentation](http://localhost:8000/api/docs/) 