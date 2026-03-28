# SOC Guard - Cybersecurity Incident Intelligence Platform

A modern, full-stack Security Operations Center (SOC) application built with Spring Boot, Angular, MySQL, and PyTorch for AI-powered threat analytics.

![SOC Dashboard](docs/dashboard-preview.png)

## Features

### Core Functionality
- **Incident Management**: Create, track, and manage security incidents with full CRUD operations
- **Real-time Alerts**: Monitor and respond to security alerts with severity-based prioritization
- **Threat Intelligence**: Track and analyze threat indicators (IPs, domains, hashes, URLs)
- **AI-Powered Analytics**: PyTorch-based predictive analytics for threat detection
- **Role-Based Access Control**: Admin, Analyst, and Viewer roles with different permissions
- **Dashboard Visualization**: Interactive charts and real-time statistics

### Modern UI/UX
- **Dark Theme**: Professional SOC-style dark interface with cyber aesthetics
- **Smooth Animations**: AOS animations, hover effects, and transitions throughout
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Charts**: Visual representation of incident data and trends
- **Glass Morphism**: Modern UI elements with backdrop blur effects

## Technology Stack

### Backend
- **Spring Boot 3.2** - Java backend framework
- **Spring Security** - JWT-based authentication
- **Spring Data JPA** - Database access with Hibernate
- **MySQL 8.0** - Relational database
- **Maven** - Build tool

### Frontend
- **Angular 17** - Modern frontend framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **AOS** - Animate On Scroll library
- **Chart.js** - Data visualization

### AI Service
- **Python 3.11** - Programming language
- **Flask** - Lightweight web framework
- **PyTorch 2.1** - Deep learning framework
- **scikit-learn** - Machine learning utilities

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Docker Desktop** (latest version)
   - [Download for Windows/Mac](https://www.docker.com/products/docker-desktop)
   - For Linux: `sudo apt-get install docker.io docker-compose`

2. **Git** (optional, for cloning)
   - [Download Git](https://git-scm.com/downloads)

## Quick Start

### Step 1: Clone or Download the Project

```bash
git clone <repository-url>
cd cybersecurity-soc-app
```

Or extract the provided ZIP file and navigate to the project folder.

### Step 2: Start the Application

Run all services with a single command:

```bash
docker-compose up --build
```

This command will:
- Build all Docker images (backend, frontend, AI service)
- Start MySQL database
- Initialize the database with sample data
- Start all services

### Step 3: Access the Application

Wait for all services to start (approximately 2-3 minutes), then access:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Main SOC Dashboard |
| Backend API | http://localhost:8080 | Spring Boot REST API |
| AI Service | http://localhost:5000 | Python AI Analytics |

### Step 4: Login

Use the default credentials:
- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
cybersecurity-soc-app/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/soc/ # Java source code
│   │   ├── config/            # Configuration classes
│   │   ├── controller/        # REST API controllers
│   │   ├── model/             # Entity models
│   │   ├── repository/        # JPA repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # JWT & Security config
│   │   └── dto/               # Data transfer objects
│   ├── src/main/resources/    # Application properties
│   ├── Dockerfile             # Backend Docker image
│   └── pom.xml                # Maven configuration
│
├── frontend/                   # Angular Application
│   ├── src/app/
│   │   ├── components/        # UI components
│   │   ├── services/          # API services
│   │   ├── models/            # TypeScript interfaces
│   │   ├── guards/            # Route guards
│   │   └── interceptors/      # HTTP interceptors
│   ├── Dockerfile             # Frontend Docker image
│   └── nginx.conf             # Nginx configuration
│
├── ai-service/                 # Python AI Service
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # AI service Docker image
│
├── database/                   # Database initialization
│   └── init.sql               # Schema and sample data
│
└── docker-compose.yml          # Docker orchestration
```

## Detailed Setup Guide

### Development Mode (Without Docker)

#### 1. Start MySQL Database

```bash
# Using Docker
docker run -d \
  --name soc-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=soc_db \
  -e MYSQL_USER=soc_user \
  -e MYSQL_PASSWORD=soc_password \
  -p 3306:3306 \
  mysql:8.0
```

#### 2. Run Backend (Spring Boot)

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

#### 3. Run Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200`

#### 4. Run AI Service (Python)

```bash
cd ai-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The AI service will be available at `http://localhost:5000`

### Docker Commands Reference

```bash
# Start all services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild all images
docker-compose up --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Validate JWT token

### Incidents
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/active` - List active incidents
- `GET /api/incidents/{id}` - Get incident by ID
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/{id}` - Update incident
- `DELETE /api/incidents/{id}` - Delete incident
- `GET /api/incidents/stats/dashboard` - Get dashboard statistics

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/new` - List new alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/{id}` - Update alert
- `DELETE /api/alerts/{id}` - Delete alert

### Threat Intelligence
- `GET /api/threat-intel` - List all indicators
- `GET /api/threat-intel/active` - List active indicators
- `POST /api/threat-intel` - Create indicator
- `PUT /api/threat-intel/{id}` - Update indicator

### AI Analytics
- `POST /api/predict/threat` - Predict threat severity
- `GET /api/analyze/incidents` - Analyze incident trends
- `GET /api/recommendations` - Get AI recommendations

## Database Schema

### Tables
- **users** - User accounts and authentication
- **incidents** - Security incidents
- **alerts** - Security alerts
- **threat_intelligence** - Threat indicators
- **audit_logs** - System audit logs
- **ai_predictions** - AI prediction history

## User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access - Create, read, update, delete all resources |
| **ANALYST** | Create and manage incidents, view analytics |
| **VIEWER** | Read-only access to dashboard and reports |

## Troubleshooting

### Issue: Services fail to start

**Solution:**
```bash
# Check Docker is running
docker --version

# Clean up and restart
docker-compose down -v
docker-compose up --build
```

### Issue: Database connection errors

**Solution:**
```bash
# Check MySQL container
docker-compose logs mysql

# Wait for MySQL to be ready (can take 30-60 seconds)
docker-compose exec mysql mysqladmin ping
```

### Issue: Frontend shows "Connection refused"

**Solution:**
- Ensure backend is running: `docker-compose logs backend`
- Check CORS configuration in backend
- Clear browser cache and reload

### Issue: AI service not responding

**Solution:**
```bash
# Check AI service logs
docker-compose logs ai-service

# Restart AI service
docker-compose restart ai-service
```

## Development Tips

### Adding New Features

1. **Backend**: Add controllers, services, and models in `backend/src/main/java/com/soc/`
2. **Frontend**: Create components in `frontend/src/app/components/`
3. **Database**: Update `database/init.sql` for schema changes

### Customizing the Theme

Edit CSS variables in `frontend/src/styles.css`:

```css
:root {
  --primary-bg: #0a0e17;      /* Main background */
  --accent-cyan: #00d4ff;      /* Primary accent */
  --accent-red: #ef4444;       /* Critical severity */
  /* ... more variables */
}
```

## Security Considerations

- Change default passwords in production
- Use HTTPS in production
- Configure proper CORS settings
- Enable 2FA for admin accounts
- Regularly update dependencies

## License

This project is for educational purposes as part of the CSIT701 Advanced Database Systems course.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Contact course instructor

---

**Happy Securing!** 
