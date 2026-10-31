
# HAVEN – Smart Apartment Management System

HAVEN is a web-based apartment management platform designed to simplify residential operations by bringing residents, administrators, and staff together in one centralized system.

## Features

- **Role-Based Access:** Separate access for Admin, Resident, and Staff.
- **Apartment Management:** Manage apartment details, availability, and occupancy.
- **Resident Management:** Register and manage resident information.
- **Maintenance Management:** Submit, assign, and track maintenance requests.
- **Staff Management:** Manage staff details and responsibilities.
- **Community Services:** Browse services and submit service requests.
- **Community Events:** Create events and manage resident registrations.
- **Announcements:** Publish important apartment updates.
- **Clubhouse Management:** View facilities and manage booking requests.

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- React Router DOM
- Lucide React
- CSS

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- Maven

### Database
- MySQL

## Project Structure

```text
HAVEN/
│
├── backend/
│   └── apartment-management/
│       ├── src/
│       ├── pom.xml
│       └── mvnw
│
├── Apartment-management/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:
- Java 25
- Node.js and npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd HAVEN
```

### 2. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE smart_apartment;
```

Configure your database username, password, and connection details in the backend's `application.properties` file.

### 3. Run the Backend

Open a terminal:

```bash
cd backend/apartment-management
```

Run the Spring Boot application:

**Windows:**
```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### 4. Run the Frontend

Open another terminal:

```bash
cd Apartment-management
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## User Roles

| Role | Responsibilities |
|---|---|
| Admin | Manage apartments, residents, staff, services, events, and announcements |
| Resident | Access apartment services, submit maintenance requests, and book facilities |
| Staff | Handle assigned maintenance responsibilities |

## Security

- JWT-based authentication
- Password hashing using BCrypt
- Role-based authorization
- Protected API endpoints

## Future Enhancements

- Maintenance progress tracking
- Real-time notifications
- Enhanced reporting and analytics
- Improved resident–staff communication

## Contributors

Developed as a project to demonstrate a centralized, role-based smart apartment management solution.

---

**HAVEN – Making Apartment Management Simpler.**
