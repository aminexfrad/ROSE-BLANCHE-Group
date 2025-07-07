# StageBloom 🌱

A comprehensive internship management platform designed to streamline the process of managing student internships, from application to completion. Built with Django REST API backend and Next.js frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

StageBloom is a modern web application that facilitates the management of internship programs. It provides different interfaces for various stakeholders:

- **Students (Stagiaires)**: Apply for internships, manage documents, track progress
- **Tutors (Tuteurs)**: Supervise interns, provide evaluations, manage planning
- **HR Managers (RH)**: Manage internship requests, generate reports, track KPIs
- **Administrators**: System configuration, user management, monitoring

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, RH, Tuteur, Stagiaire)
- Secure password management
- Session management

### 📊 Dashboard & Analytics
- Role-specific dashboards
- Interactive charts and KPIs
- Real-time statistics
- Export capabilities

### 📝 Internship Management
- Internship application system
- Document upload and management
- Progress tracking
- Evaluation system

### 📧 Communication
- Email notifications
- Real-time notifications
- Messaging system between users

### 📈 Reporting
- Automated report generation
- KPI tracking
- Data visualization
- Export to PDF

### 🎨 User Experience
- Responsive design
- Dark/Light theme
- Modern UI components
- Mobile-friendly interface

## 🏗️ Architecture

The project follows a microservices-inspired architecture with clear separation of concerns:

```
StageBloom/
├── backend/                 # Django REST API
│   ├── auth_service/       # Authentication & user management
│   ├── demande_service/    # Internship request management
│   ├── rh_service/         # HR management features
│   ├── shared/             # Shared utilities and models
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
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: MySQL
- **Task Queue**: Celery + Redis
- **Documentation**: drf-yasg (Swagger/OpenAPI)
- **File Storage**: Django Storages + Pillow

### Frontend
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts 2.15.0
- **Animations**: Framer Motion 12.20.1

### DevOps & Tools
- **Version Control**: Git
- **Package Managers**: npm/pnpm (frontend), pip (backend)
- **Environment**: Python 3.8+, Node.js 18+

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- MySQL 8.0+
- Redis (for Celery)
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
   ```

4. **Set up database**
   ```bash
   cd gateway
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run the server**
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
│   ├── serializers.py    # User serializers
│   └── urls.py           # Auth endpoints
├── demande_service/       # Internship request management
│   ├── models.py         # Request models
│   ├── views.py          # Request views
│   ├── serializers.py    # Request serializers
│   └── urls.py           # Request endpoints
├── rh_service/           # HR management
│   ├── models.py         # HR models
│   ├── views.py          # HR views
│   └── urls.py           # HR endpoints
├── shared/               # Shared utilities
│   ├── models.py         # Common models
│   └── utils.py          # Utility functions
└── gateway/              # Main Django project
    ├── settings.py       # Django settings
    ├── urls.py           # Main URL configuration
    └── templates/        # Email templates
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
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/refresh/` - Token refresh
- `POST /api/auth/logout/` - User logout

#### Internship Requests
- `GET /api/demandes/` - List internship requests
- `POST /api/demandes/` - Create new request
- `GET /api/demandes/{id}/` - Get request details
- `PUT /api/demandes/{id}/` - Update request
- `DELETE /api/demandes/{id}/` - Delete request

#### User Management
- `GET /api/users/` - List users
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=your-domain.com
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-email-password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=StageBloom
```

### Deployment Steps

1. **Backend Deployment**
   ```bash
   # Collect static files
   python manage.py collectstatic
   
   # Run migrations
   python manage.py migrate
   
   # Start with gunicorn
   gunicorn stagebloom.wsgi:application
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   
   # Start production server
   npm run start
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** (if applicable)
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Write meaningful commit messages
- Add documentation for new features
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 **Documentation**: Check the README files in each directory
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: Contact the development team

### Common Issues

#### Backend Issues
- **Database connection**: Check MySQL service and credentials
- **Migration errors**: Run `python manage.py migrate --run-syncdb`
- **Static files**: Ensure `collectstatic` is run in production

#### Frontend Issues
- **Build errors**: Clear `.next` folder and reinstall dependencies
- **API connection**: Verify `NEXT_PUBLIC_API_URL` in environment
- **Styling issues**: Check Tailwind CSS configuration

## 🔗 Related Links

- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [API Documentation](http://localhost:8000/api/docs/)
- [Project Wiki](https://github.com/your-org/stagebloom/wiki)

## 🙏 Acknowledgments

- Django REST Framework team
- Next.js team
- Radix UI for excellent components
- Tailwind CSS for styling utilities
- All contributors and maintainers

---

**StageBloom** - Growing the future of internship management 🌱 