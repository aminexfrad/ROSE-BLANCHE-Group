# StageBloom 🌱

A comprehensive internship management platform designed to streamline the process of managing student internships, from application to completion. Built with Django REST API backend and Next.js frontend, featuring enterprise-grade security and modern development practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Security Features](#security-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security Documentation](#security-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

StageBloom is a modern web application that facilitates the management of internship programs with enterprise-grade security. It provides different interfaces for various stakeholders:

- **Students (Stagiaires)**: Apply for internships, manage documents, track progress
- **Tutors (Tuteurs)**: Supervise interns, provide evaluations, manage planning
- **HR Managers (RH)**: Manage internship requests, generate reports, track KPIs
- **Administrators**: System configuration, user management, monitoring

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with token rotation
- Role-based access control (Admin, RH, Tuteur, Stagiaire)
- Secure password management with complexity validation
- Session management with secure cookies
- Rate limiting and brute force protection

### 📊 Dashboard & Analytics
- Role-specific dashboards
- Interactive charts and KPIs
- Real-time statistics
- Export capabilities

### 📝 Internship Management
- Internship application system with secure file uploads
- Document upload and management with validation
- Progress tracking with automated notifications
- Evaluation system with 360° feedback

### 📧 Communication
- Email notifications with template system
- Real-time notifications
- Messaging system between users
- Secure email validation and sanitization

### 📈 Reporting
- Automated report generation
- KPI tracking and visualization
- Data export to PDF
- Comprehensive audit trails

### 🎨 User Experience
- Responsive design with modern UI
- Dark/Light theme support
- Modern UI components with accessibility
- Mobile-friendly interface

## 🔒 Security Features

### Input Validation & Sanitization
- **Comprehensive Validation**: All user inputs validated with regex patterns
- **SQL Injection Prevention**: Pattern detection and blocking
- **XSS Protection**: HTML sanitization and Content Security Policy
- **File Upload Security**: Type, size, and content validation
- **Path Traversal Prevention**: Secure filename handling

### Authentication & Authorization
- **JWT Security**: Token rotation and blacklisting
- **Password Security**: Minimum length, complexity, and common password blocking
- **Rate Limiting**: IP-based request limiting with configurable thresholds
- **Session Security**: Secure cookies with SameSite policy

### Security Headers & Middleware
- **Content Security Policy**: Comprehensive CSP implementation
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **CSRF Protection**: Enhanced CSRF middleware configuration
- **HTTPS Enforcement**: SSL redirect in production

### Environment Security
- **Sensitive Data Protection**: All credentials in environment variables
- **Database Security**: MySQL strict mode and parameterized queries
- **Logging & Monitoring**: Security event logging and alerting
- **Error Handling**: Sanitized error messages in production

## 🏗️ Architecture

The project follows a microservices-inspired architecture with clear separation of concerns and enhanced security:

```
StageBloom/
├── backend/                 # Django REST API with security
│   ├── auth_service/       # Authentication & user management
│   ├── demande_service/    # Internship request management
│   ├── rh_service/         # HR management features
│   ├── shared/             # Shared utilities and security modules
│   │   ├── security.py    # Security validation and middleware
│   │   └── utils.py       # Enhanced utilities with security
│   └── gateway/            # Main Django project
├── frontend/               # Next.js React application
│   ├── app/               # Pages and routing
│   ├── components/        # Reusable UI components
│   └── lib/               # Utilities and API client
└── docs/                  # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt) with enhanced security
- **Database**: MySQL 8+ with strict mode
- **Task Queue**: Celery 5.3+ with Redis 5+
- **File Storage**: Django Storages, Pillow with security validation
- **Email**: Django Email Backend with sanitization
- **Documentation**: drf-yasg (Swagger/OpenAPI)
- **Security**: 
  - Input validation and sanitization
  - SQL injection prevention
  - XSS protection with CSP
  - CSRF protection
  - Rate limiting
  - File upload security
  - Environment variable management
- **Testing**: Django Test, pytest with security test suite
- **Monitoring**: Comprehensive logging and error tracking
- **Other**: django-cors-headers, django-filter, bleach, django-ratelimit

### Frontend
- **Framework**: Next.js 15.2.4 (React 18+)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI, Lucide React, custom components
- **State Management**: React Context API
- **Forms**: React Hook Form, Zod with validation
- **Charts**: Recharts 2.15.0
- **Animations**: Framer Motion 12.20.1
- **Notifications**: Sonner 1.7.1
- **Security**: Input sanitization, CSRF, XSS protection
- **Performance**: Code splitting, lazy loading, memoization
- **Testing**: Jest, React Testing Library
- **Linting/Formatting**: ESLint, Prettier

### DevOps & Tooling
- **Version Control**: Git
- **Package Managers**: npm, pnpm (frontend), pip (backend)
- **Environment**: Python 3.8+, Node.js 18+
- **CI/CD**: Ready for deployment pipelines
- **Security Scanning**: Automated vulnerability detection

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- MySQL 8.0+
- Redis (for Celery and caching)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StageBloom
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database and email settings
   # Ensure all security variables are properly configured
   ```

4. **Set up database**
   ```bash
   cd gateway
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run security tests**
   ```bash
   python test_security_improvements.py
   ```

6. **Run the server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env.local
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs/

## 📁 Project Structure

### Backend Services

```
backend/
├── auth_service/          # User authentication & authorization
│   ├── models.py         # User models
│   ├── views.py          # Authentication views
│   ├── serializers.py    # User serializers with security validation
│   └── urls.py           # Auth endpoints
├── demande_service/       # Internship request management
│   ├── models.py         # Request models
│   ├── views.py          # Request views
│   ├── serializers.py    # Request serializers with file validation
│   └── urls.py           # Request endpoints
├── rh_service/           # HR management
│   ├── models.py         # HR models
│   ├── views.py          # HR views
│   └── urls.py           # HR endpoints
├── shared/               # Shared utilities and security
│   ├── models.py         # Common models
│   ├── security.py       # Security validation and middleware
│   ├── utils.py          # Enhanced utilities with security
│   └── validators.py     # Input validation helpers
├── gateway/              # Main Django project
│   ├── settings.py       # Django settings with security config
│   ├── urls.py           # Main URL configuration
│   └── templates/        # Email templates
├── SECURITY.md           # Comprehensive security documentation
├── README_REFACTORING.md # Refactoring documentation
└── test_security_improvements.py # Security test suite
```

### Frontend Structure

```
frontend/
├── app/                  # Next.js app directory
│   ├── admin/           # Admin dashboard
│   ├── rh/              # HR dashboard
│   ├── tuteur/          # Tutor dashboard
│   ├── stagiaire/       # Intern dashboard
│   ├── public/          # Public pages
│   └── login/           # Authentication
├── components/          # Reusable components
│   ├── ui/              # Base UI components
│   └── ...              # Custom components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
└── lib/                 # Utilities and API
```

## 📚 API Documentation

The API documentation is automatically generated using drf-yasg and available at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

### Key API Endpoints

#### Authentication
- `POST /api/auth/login/` - User login with security validation
- `POST /api/auth/register/` - User registration with input sanitization
- `POST /api/auth/refresh/` - Token refresh with rotation
- `POST /api/auth/logout/` - User logout with token blacklisting

#### Internship Requests
- `GET /api/demandes/` - List internship requests
- `POST /api/demandes/` - Create new request with file validation
- `GET /api/demandes/{id}/` - Get request details
- `PUT /api/demandes/{id}/` - Update request with validation
- `DELETE /api/demandes/{id}/` - Delete request

#### User Management
- `GET /api/users/` - List users
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user with security validation
- `DELETE /api/users/{id}/` - Delete user

## 🔒 Security Documentation

### Security Features Overview
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Pattern detection and blocking
- **XSS Protection**: HTML sanitization and CSP implementation
- **CSRF Protection**: Enhanced CSRF middleware configuration
- **File Upload Security**: Type, size, and content validation
- **Rate Limiting**: IP-based request limiting
- **Authentication Security**: JWT with token rotation and blacklisting

### Security Testing
```bash
# Run comprehensive security tests
python test_security_improvements.py

# Test specific security features
python manage.py test --pattern="*security*"
```

### Security Configuration
- **Environment Variables**: All sensitive data in environment variables
- **Database Security**: MySQL strict mode and parameterized queries
- **Logging**: Security event logging and monitoring
- **Error Handling**: Sanitized error messages in production

For detailed security documentation, see:
- [Security Documentation](backend/SECURITY.md)
- [Refactoring Documentation](backend/README_REFACTORING.md)

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
# Security Settings
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=your-domain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Database Settings
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Email Settings
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-email-password

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=3600

# File Upload Security
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/gif
MAX_UPLOAD_SIZE=10485760
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=StageBloom
```

### Deployment Steps

1. **Backend Deployment**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Run security tests
   python test_security_improvements.py
   
   # Collect static files
   python manage.py collectstatic
   
   # Run migrations
   python manage.py migrate
   
   # Start with gunicorn
   gunicorn stagebloom.wsgi:application
   ```

2. **Frontend Deployment**
   ```bash
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   
   # Start production server
   npm run start
   ```

### Security Checklist for Deployment
- [ ] Generate new SECRET_KEY
- [ ] Configure HTTPS certificates
- [ ] Set DEBUG=False
- [ ] Update ALLOWED_HOSTS
- [ ] Configure secure database credentials
- [ ] Set up logging directory
- [ ] Test all authentication flows
- [ ] Verify file upload security
- [ ] Check rate limiting functionality
- [ ] Monitor security logs

## 🧪 Testing

### Security Testing
```bash
# Run comprehensive security test suite
python test_security_improvements.py

# Run Django security tests
python manage.py test --pattern="*security*"

# Test file upload security
python manage.py test demande_service.tests.test_file_upload
```

### Integration Testing
```bash
# Test all authentication endpoints
python manage.py test auth_service.tests

# Test demande service endpoints
python manage.py test demande_service.tests

# Test file upload functionality
python manage.py test shared.tests.test_file_upload
```

### Manual Security Testing Checklist
- [ ] SQL injection attempts
- [ ] XSS payload testing
- [ ] CSRF token validation
- [ ] File upload security
- [ ] Rate limiting effectiveness
- [ ] Authentication bypass attempts

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** (including security tests if applicable)
5. **Run security tests**
   ```bash
   python test_security_improvements.py
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Write meaningful commit messages
- Add documentation for new features
- Test your changes thoroughly
- **Security First**: Always consider security implications
- Run security tests before submitting PRs

### Security Guidelines for Contributors
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries
- Implement proper authentication checks
- Test for common vulnerabilities
- Follow the security documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 **Documentation**: Check the README files in each directory
- 🔒 **Security Documentation**: [Security Guide](backend/SECURITY.md)
- 🏗️ **Refactoring Documentation**: [Refactoring Guide](backend/README_REFACTORING.md)
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: Contact the development team

### Common Issues

#### Backend Issues
- **Database connection**: Check MySQL service and credentials
- **Migration errors**: Run `python manage.py migrate --run-syncdb`
- **Static files**: Ensure `collectstatic` is run in production
- **Security validation errors**: Check input format and sanitization

#### Frontend Issues
- **Build errors**: Clear `.next` folder and reinstall dependencies
- **API connection**: Verify `NEXT_PUBLIC_API_URL` in environment
- **Styling issues**: Check Tailwind CSS configuration
- **Security headers**: Verify CORS and CSP configuration

## 🔗 Related Links

- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [Security Documentation](backend/SECURITY.md)
- [Refactoring Documentation](backend/README_REFACTORING.md)
- [API Documentation](http://localhost:8000/api/docs/)
- [Project Wiki](https://github.com/your-org/stagebloom/wiki)

## 🙏 Acknowledgments

- Django REST Framework team
- Next.js team
- Radix UI for excellent components
- Tailwind CSS for styling utilities
- Security community for best practices
- All contributors and maintainers

---

**StageBloom** - Growing the future of internship management with enterprise-grade security 🌱🔒 