# Campus Genius - Modern Educational Platform

Campus Genius is a comprehensive educational platform that facilitates seamless interaction between faculty and students. It provides a modern, feature-rich environment for course management, content delivery, and student engagement.

## Features

### Faculty Features
- **Course Management**
  - Create and manage courses
  - Upload course materials
  - Schedule lectures and meetings
  - Track student progress
  - Generate analytics

- **Content Creation**
  - Upload video lectures
  - Create and share notes
  - Design quizzes and assignments
  - Share resources and materials

- **Student Engagement**
  - Real-time meeting attendance
  - Quiz and assignment submissions
  - Progress tracking
  - Doubt resolution system

- **AI-Powered Tools**
  - Code review assistance
  - Plagiarism detection
  - Automated grading
  - Learning analytics

### Student Features
- **Learning Management**
  - Course enrollment
  - Video lecture progress tracking
  - Note taking and bookmarking
  - Assignment and quiz submissions

- **Collaboration**
  - Study group creation and management
  - Group messaging
  - Resource sharing
  - Doubt posting and resolution

- **Progress Tracking**
  - Course progress monitoring
  - Performance analytics
  - Learning path customization
  - Achievement tracking

## Technology Stack

### Backend
- Django 5.2
- Django REST Framework
- PostgreSQL
- Redis (for caching)
- Celery (for async tasks)

### Frontend
- React.js
- Redux
- Material-UI
- Axios
- Socket.io (for real-time features)

### AI Integration
- OpenAI API
- Custom ML models
- Natural Language Processing

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Redis 6+

### Backend Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-genius.git
cd campus-genius/campus-genius-backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd ../campus-genius
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
npm start
```

## API Documentation

The API documentation is available at `/api/docs/` when running the development server. It includes:
- Authentication endpoints
- Faculty endpoints
- Student endpoints
- Resource endpoints
- AI tool endpoints

## Project Structure

```
campus-genius/
├── campus-genius-backend/
│   ├── apps/
│   │   ├── faculty/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── student/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── core/
│   │   └── common/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── manage.py
└── campus-genius-frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Role-based access control
- Session management
- Password reset functionality

### Course Management
- Course creation and enrollment
- Content organization
- Progress tracking
- Analytics dashboard

### Content Delivery
- Video streaming
- Document sharing
- Real-time updates
- Offline access

### Assessment System
- Quiz creation and management
- Assignment submission
- Automated grading
- Performance analytics

### Collaboration Tools
- Study groups
- Discussion forums
- Resource sharing
- Real-time messaging

## Development Guidelines

### Code Style
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Maintain consistent naming conventions
- Write meaningful commit messages

### Testing
- Write unit tests for all new features
- Maintain minimum 80% test coverage
- Run tests before submitting PRs
- Use pytest for Python tests
- Use Jest for React tests

### Documentation
- Document all new features
- Update API documentation
- Maintain changelog
- Write clear commit messages

### Security
- Follow OWASP guidelines
- Regular security audits
- Dependency updates
- Input validation
- XSS and CSRF protection

## Deployment

### Production Setup
1. Set up production environment variables
2. Configure SSL certificates
3. Set up database backups
4. Configure monitoring and logging
5. Set up CI/CD pipeline

### Deployment Steps
1. Build frontend:
```bash
cd campus-genius-frontend
npm run build
```

2. Collect static files:
```bash
cd ../campus-genius-backend
python manage.py collectstatic
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start production server:
```bash
gunicorn config.wsgi:application
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@campusgenius.com or create an issue in the repository.

## Acknowledgments

- Django and Django REST Framework teams
- React and Material-UI communities
- All contributors to this project 