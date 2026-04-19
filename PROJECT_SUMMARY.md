# SOC Guard - Project Summary

## Overview

This is a complete **Cybersecurity Incident Intelligence Database** application built as a full-stack solution for CSIT701 Advanced Database Systems project. It features a modern SOC (Security Operations Center) interface with animations, AI-powered analytics, and comprehensive incident management capabilities.

## What To Expect On This Project

### 1. Complete Application Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Angular 17 + TypeScript | Modern, animated SOC dashboard |
| **Backend** | Spring Boot 3.2 + Java | RESTful API with JWT security |
| **Database** | MySQL 8.0 | Data persistence with optimized schema |
| **AI Service** | Python + Flask + PyTorch | Predictive analytics & recommendations |
| **Infrastructure** | Docker + Docker Compose | Easy deployment |

### 2. Key Features Implemented

#### Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Analyst, Viewer)
- Password encryption with BCrypt
- Secure API endpoints

#### Incident Management
- Full CRUD operations for incidents
- Severity levels: Critical, High, Medium, Low, Info
- Status tracking: Open, In Progress, Resolved, Closed
- Assignment to analysts
- IP tracking and attack vector analysis

#### Alert System
- Real-time alert monitoring
- Severity-based prioritization
- Acknowledge/Resolve workflow
- Source tracking

#### Threat Intelligence
- Indicator tracking (IP, Domain, URL, Hash, Email)
- Confidence scoring
- Active/Inactive status
- Threat type categorization

#### Dashboard & Analytics
- Real-time statistics cards
- Severity distribution charts
- Status donut charts
- Threat gauge visualization
- Recent activity timeline
- AI-powered recommendations

#### Modern UI/UX
- Dark cyber-themed interface
- Smooth animations (AOS, CSS transitions)
- Responsive design
- Glass morphism effects
- Hover animations
- Loading states

### 3. Project Structure

```
cybersecurity-soc-app/
├── backend/              # Spring Boot application
│   ├── src/main/java/   # Java source code
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/            # Angular application
│   ├── src/app/        # Components, services, models
│   ├── Dockerfile
│   └── nginx.conf
├── ai-service/         # Python AI service
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── database/           # Database initialization
│   └── init.sql
├── docker-compose.yml  # Orchestration
├── README.md          # Full documentation
├── start.sh           # Linux/Mac start script
└── start.bat          # Windows start script
```

## How to Run

### Quick Start (Recommended)

1. **Ensure Docker Desktop is installed and running**

2. **Open terminal/command prompt in the project folder**

3. **Run the start script:**
   
   **Linux/Mac:**
   ```bash
   ./start.sh
   ```
   
   **Windows:**
   ```cmd
   start.bat
   ```

4. **Or use Docker directly:**
   ```bash
   docker-compose up --build
   ```

5. **Wait 2-3 minutes for all services to start**

6. **Access the application:**
   - Dashboard: http://localhost:4200
   - Sign In
     
## API Endpoints

### Authentication
- `POST /api/auth/login` - Login

### Incidents
- `GET /api/incidents` - List all
- `POST /api/incidents` - Create
- `PUT /api/incidents/{id}` - Update
- `DELETE /api/incidents/{id}` - Delete

### Dashboard
- `GET /api/incidents/stats/dashboard` - Statistics

## Database Schema

### Tables Created
1. **users** - User accounts
2. **incidents** - Security incidents
3. **alerts** - Security alerts
4. **threat_intelligence** - Threat indicators
5. **audit_logs** - System logs
6. **ai_predictions** - AI predictions

### Sample Data Included
- 1 admin user
- 4 sample incidents
- 4 threat intelligence indicators
- 4 sample alerts

## Customization

### Changing Colors
Edit `frontend/src/styles.css`:
```css
:root {
  --accent-cyan: #00d4ff;    /* Change primary color */
  --accent-red: #ef4444;     /* Change critical color */
}
```

### Adding Features
1. **Backend**: Add controllers in `backend/src/main/java/com/soc/controller/`
2. **Frontend**: Add components in `frontend/src/app/components/`
3. **Database**: Update `database/init.sql`

## Troubleshooting

### Services won't start
```bash
docker-compose down -v
docker-compose up --build
```

### Database connection issues
- Wait 30-60 seconds after MySQL starts
- Check logs: `docker-compose logs mysql`

### Port conflicts
- Ensure ports 3306, 8080, 4200, 5000 are free
- Or modify `docker-compose.yml` to use different ports

## Project Requirements Met

### Advanced Database Systems
- [x] MySQL database with proper schema design
- [x] ORM usage (Hibernate/JPA)
- [x] Complex queries with aggregations
- [x] Relationships between entities
- [x] Database optimization

### Full Stack Development
- [x] Spring Boot backend
- [x] Angular frontend
- [x] RESTful APIs
- [x] Authentication & Authorization (JWT)
- [x] Form validation
- [x] Error handling and logging

### AI Integration
- [x] PyTorch model for threat prediction
- [x] AI-powered recommendations
- [x] Trend analysis
- [x] Predictive analytics endpoint

### Professional Practices
- [x] Docker containerization
- [x] Documentation
- [x] Code organization
- [x] Security best practices

## Next Steps (Optional Enhancements)

1. **Real-time Updates**: Add WebSocket for live alerts
2. **Email Notifications**: Integrate email service
3. **Report Generation**: Add PDF export functionality
4. **Threat Feed Integration**: Connect to external threat APIs
5. **Mobile App**: Create companion mobile application

## Support

For issues:
1. Check `README.md` for detailed instructions
2. Review Docker logs: `docker-compose logs`
3. Check browser console for frontend errors

