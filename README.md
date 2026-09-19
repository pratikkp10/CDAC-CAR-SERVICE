
# Online Car Service Station

A full-stack web application developed as part of the CDAC PG-DMC project. The application simplifies vehicle maintenance by allowing customers to manage their cars, explore services, book appointments, and track service progress.

## Project Overview

The **Online Car Service Station** is designed to make car maintenance simple, transparent, and accessible.

Customers can register, manage their vehicles, explore available services, select service stations, book appointments, track booking status, and view receipts.

Administrators can manage users, services, service stations, bookings, pricing, and payment details.

The application also includes a Super Admin module for managing administrator accounts.

## Key Features

### Customer Features

- User registration and login
- JWT-based authentication
- Secure password hashing
- Add, update, and delete vehicles
- Browse available car services
- View available service stations
- Book service appointments
- Update or cancel eligible bookings
- View booking history
- Track booking status
- View service receipts
- View payment details
- Manage profile information
- Update account password

### Admin Features

- Admin dashboard
- Manage customers
- View customer vehicles
- Manage car services
- Add, update, and deactivate services
- Manage service stations
- Configure station-specific service prices
- View and manage bookings
- Update booking status
- Manage receipts and payment information

### Super Admin Features

- Super Admin dashboard
- Manage administrator accounts
- Create administrator accounts
- Update administrator details
- Activate or deactivate administrator accounts
- Role-based administrative access

## Technology Stack

### Frontend

- Next.js
- React.js
- JavaScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- REST APIs
- JSON Web Token
- bcryptjs
- CORS
- dotenv

### Database

- MySQL

### Development Tools

- Visual Studio Code
- Postman
- Git
- GitHub
- PowerShell

## Project Architecture

The project follows a full-stack client-server architecture.

```text
Frontend: Next.js + React
          │
          │ HTTP Requests / REST APIs
          ▼
Backend: Node.js + Express.js
          │
          │ SQL Queries
          ▼
Database: MySQL
````

## Project Structure

```text
CDAC-CAR-SERVICE/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── superadmin/
│   │   ├── login/
│   │   └── services/
│   ├── package.json
│   └── next.config.mjs
│
├── .gitignore
└── README.md
```

## Database Modules

The application uses MySQL to manage the following information:

* Users
* Cars
* Services
* Bookings
* Service stations
* Station-specific service prices
* Booking history
* Receipts
* Payment details
* Messages

## Authentication and Authorization

The application implements authentication and authorization using:

* JWT-based authentication
* Password hashing using bcryptjs
* Bearer-token authentication
* Role-based access control
* Protected customer routes
* Protected admin routes
* Protected Super Admin routes

### Supported Roles

* Customer
* Admin
* Super Admin

## Main Application Workflow

```text
Customer Registration/Login
          │
          ▼
      Add Vehicle
          │
          ▼
  Select Service Station
          │
          ▼
    Select Car Service
          │
          ▼
    Book Appointment
          │
          ▼
   Admin Updates Status
          │
          ▼
    Service Completed
          │
          ▼
    Receipt Generated
          │
          ▼
   Payment Information
```

## API Modules

The backend contains API modules for:

* Authentication
* Vehicle management
* Booking management
* Booking history
* Service management
* Service station management
* Station-specific pricing
* Receipt management
* Messaging
* Admin management
* Super Admin management

## Installation and Setup

### Prerequisites

Install the following software before running the project:

* Node.js
* npm
* MySQL Server
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/pratikkp10/CDAC-CAR-SERVICE.git
cd CDAC-CAR-SERVICE
```

### 2. Set Up the Database

1. Start MySQL Server.
2. Create a database named `car_service`.
3. Import the required database tables and data.
4. Update the database credentials in the backend environment file.

Example:

```sql
CREATE DATABASE car_service;
```

> Note: The database backup file is not included in the GitHub repository. The required database structure must be created separately.

### 3. Backend Setup

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

Example configuration:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_service
jwt_secret=your_secret_key
```

Start the backend server:

```bash
node server.js
```

The backend will run at:

```text
http://localhost:5000
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

Open the application in your browser:

```text
http://localhost:3000
```

## Important Notes

* Do not upload `.env` files to GitHub.
* Make sure MySQL is running before starting the backend.
* Ensure the backend is running before using the frontend.
* Update the database credentials according to your local MySQL configuration.
* The application is intended for educational and demonstration purposes.

## Future Enhancements

* Online payment gateway integration
* Email and SMS notifications
* Customer reviews and ratings
* Automated service reminders
* Improved real-time chat functionality
* Cloud deployment
* Mobile application integration

## Author

**Pratik Narendra Panchal**

Post Graduate Diploma in Mobile Computing
CDAC PG-DMC

## GitHub Repository

[View the Project on GitHub](https://github.com/pratikkp10/CDAC-CAR-SERVICE.git)

````
