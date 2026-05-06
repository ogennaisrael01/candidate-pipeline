# Candidate Pipeline System - Project Description

## Project Name

**Candidate Pipeline** — A job application management system that streamlines candidate submissions, resume uploads and automated candidate application processing.

---

## Overview

Candidate Pipeline is a backend system designed to manage job applications from candidates. When a candidate applies for a job, they submit their personal information along with a resume. The system stores this information in a database, makes the resume immediately available for download, and automatically sends a confirmation email to the applicant. 

The system is built for companies that want a simple, reliable way to collect and track job applications. Rather than managing spreadsheets or emails, all applications flow through a single API endpoint where they are validated, stored securely in a database, and processed through an automated job queue.

This is the backend API only — it provides a single endpoint for applications and manages all the business logic behind the scenes, including file storage, data persistence, and email notifications.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | 5.2.1 | Web framework for building the REST API and handling HTTP requests |
| **Node.js** | ES Modules | JavaScript runtime using modern module syntax |
| **PostgreSQL** | Latest | Primary database for storing application records |
| **Prisma** | 7.8.0 | ORM (Object-Relational Mapping) for type-safe database access and migrations |
| **Redis** | 5.12.1 | In-memory message broker for the job queue system |
| **BullMQ** | 5.76.6 | Job queue library built on Redis for async task processing |
| **Multer** | 2.1.1 | Middleware for handling file uploads (resumes) |
| **Zod** | 4.4.3 | Data validation library for input schema validation |
| **Winston** | 3.19.0 | Logging library for structured application logs |
| **IORedis** | 5.10.1 | Redis client library with connection management |
| **dotenv** | 17.4.2 | Environment variable loader for configuration |
| **Nodemon** | Dev only | Development tool for automatic restart on file changes |

---

## System Architecture

The project is organized into a modular structure where concerns are separated:

```
├── app.js                    # Application entry point
├── logger.js                 # Centralized logging setup
├── routes_controllers.js      # Route registration and mounting
├── package.json              # Dependencies and scripts
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   └── migrations/          # Database migration files
├── src/
│   ├── contollers/          # Business logic for handling requests
│   ├── routes/              # API endpoint definitions
│   ├── middlewares/         # HTTP middleware (file upload handling)
│   ├── lib/                 # Utility libraries (Prisma, Redis)
│   ├── validators/          # Input validation schemas
│   └── queue/               # Job queue setup and workers
├── generated/               # Auto-generated Prisma client
├── uploads/                 # Directory for storing uploaded resumes
└── logs/                    # Application log files
```

**Key Components:**

- **Entry Point (app.js)**: Initializes Express server, registers routes, and starts the application
- **Routes** (`src/routes/`): Defines API endpoints and maps them to controller functions
- **Controllers** (`src/contollers/`): Contains business logic for processing applications
- **Validators** (`src/validators/`): Zod schemas that validate incoming request data
- **Middleware** (`src/middlewares/`): Multer configuration for resume file uploads
- **Libraries** (`src/lib/`): Core integrations with Prisma (database) and Redis (queue)
- **Queue System** (`src/queue/`): BullMQ workers and event handlers for async email processing
- **Database** (`prisma/`): Schema definitions and migration history
- **Logging**: Centralized Winston logger that writes to console and files

---

## Core Features

### 1. Job Application Submission
**What it does:** Candidates submit their information and resume to apply for a job.

**How it works:** When a POST request is received at `/api/applications`, the system:
1. Validates all required fields (first name, last name, email, phone, location)
2. Verifies a resume file is attached
3. Saves the resume to the server's upload directory with a timestamped filename
4. Creates an Application record in the database with all candidate information
5. Adds an email task to the job queue to send a confirmation email

**Who uses it:** Job candidates

### 2. Resume Storage and Access
**What it does:** Uploaded resumes are stored on the server and made accessible for download.

**How it works:** Resumes are saved to the `uploads/` directory with timestamped filenames to ensure uniqueness. A public endpoint at `/uploads/{filename}` serves these files so recruiters can view or download resumes directly.

**Who uses it:** Recruiters and hiring teams

### 3. Application Data Management
**What it does:** All applications are stored in a PostgreSQL database with candidate information and metadata.

**How it works:** Each application is stored with the candidate's name, email, phone, location, resume URL, submission timestamp, and current status. Applications can be queried, filtered, and updated in the database.

**Who uses it:** Internal systems and recruitment teams

### 4. Automated Email Notifications
**What it does:** Confirmation emails are automatically sent to applicants after they submit their application.

**How it works:** When an application is created, an email task is added to a Redis-backed job queue. A BullMQ worker picks up the task asynchronously and sends the email. If the email fails, it automatically retries up to 3 times with exponential backoff. Status is logged throughout the process.

**Who uses it:** Job candidates (receive emails), system operators (monitor queue)

### 5. Application Status Tracking
**What it does:** Track where each candidate is in the hiring pipeline.

**How it works:** Each application has a status field that can be one of: `submitted`, `shortlisted`, `rejected`, or `hired`. This status can be updated as candidates progress through the hiring process.

**Who uses it:** Hiring teams and recruiters

### 6. Structured Logging
**What it does:** All system events are logged with timestamps and details.

**How it works:** Winston logger captures all application events (new applications, job queue operations, errors) and writes them to both console output and log files. Errors are written to a separate error log file.

**Who uses it:** Operations and debugging teams

---

## API Overview

### Application Endpoints

#### **Submit Application**
```
POST /api/applications
Content-Type: multipart/form-data
```

**Request:**
- **Body (form data):**
  - `firstName` (string, required): Candidate's first name
  - `lastName` (string, required): Candidate's last name
  - `email` (string, required, unique): Candidate's email address
  - `phone` (string, required, unique): Candidate's phone number
  - `location` (string, required): Candidate's location
  - `resume` (file, required): Resume document

**Response (201 Created):**
```json
{
  "status": true,
  "details": {
    "id": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York",
    "resume_url": "http://localhost:3000/uploads/1620000000000-resume.pdf",
    "status": "submitted",
    "appliedAt": "2026-05-06T10:30:00.000Z",
    "updatedAt": "2026-05-06T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Missing required fields or invalid email format
```json
{
  "status": false,
  "details": "resume cannot be empty"
}
```

### Static File Serving

#### **Retrieve Resume**
```
GET /uploads/{filename}
```
Returns the uploaded resume file for download.

---

## Authentication & Security

**Current Security Measures:**

1. **Input Validation:** All submitted data is validated against a Zod schema before processing. Invalid data is rejected with a 400 error response.

2. **Unique Constraints:** Email and phone fields have database-level unique constraints, preventing duplicate applications from the same contact.

3. **File Upload Validation:** Multer ensures files are only saved to the designated `uploads/` directory with timestamped filenames, preventing directory traversal attacks.

4. **File Access:** Uploaded files are served as static assets through Express's static middleware, preventing execution of malicious scripts.

5. **No Authentication Currently:** The current implementation has no authentication layer. The API is publicly accessible. In production, you would typically add:
   - OAuth 2.0 or JWT token-based authentication for recruiter access
   - Rate limiting to prevent abuse
   - CORS restrictions

6. **Error Handling:** Sensitive error details are not exposed to clients; errors are logged server-side for debugging.

---

## Payment Flow

**Not Applicable** — This system does not handle payments. It is a job application management system only.

---

## Database Design

### Application Model

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary Key, Auto-generated | Unique identifier for the application |
| `firstName` | String | Required | Candidate's first name |
| `lastName` | String | Required | Candidate's last name |
| `email` | String | Required, Unique | Candidate's email address (prevents duplicate applications) |
| `phone` | String | Required, Unique | Candidate's phone number (prevents duplicate applications) |
| `location` | String | Required | Candidate's geographic location or office preference |
| `status` | Enum | Default: `submitted` | Current hiring stage: `submitted`, `shortlisted`, `rejected`, `hired` |
| `resume_url` | String | Required | Full URL to the stored resume file |
| `appliedAt` | DateTime | Default: now() | Timestamp when application was created |
| `updatedAt` | DateTime | Auto-updated | Timestamp of last modification |

**Relationships:** Currently, there are no foreign key relationships. The Application model is standalone.

**Indexes:** Email and phone have unique indexes for constraint enforcement.

---

## Getting Started

### Prerequisites

Before setting up this project, ensure you have:

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) — [Download](https://www.postgresql.org/download/)
- **Redis** (v6 or higher) — [Download](https://redis.io/download/) or use [Docker](https://hub.docker.com/_/redis)
- **Git** (optional, for cloning the repository)
- **Postman** or **cURL** (for testing API endpoints)

### Installation Steps

1. **Clone the repository** (or download the project files):
   ```bash
   git clone <repository-url>
   cd candidate_pipeline
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root directory:
   ```bash
   touch .env
   ```

   Add the following variables (see below for details):
   ```env
   PORT_NAME=3000
   HOST_NAME=127.0.0.1
   DATABASE_URL=postgresql://user:password@localhost:5432/candidate_pipeline
   REDIS_URL=redis://localhost:6379
   BASE_URL=http://localhost:3000
   ```

4. **Create the PostgreSQL database:**
   ```bash
   # Connect to PostgreSQL as a superuser
   psql -U postgres
   
   # In the PostgreSQL prompt:
   CREATE DATABASE candidate_pipeline;
   \q
   ```

5. **Run Prisma migrations to set up the database schema:**
   ```bash
   npx prisma migrate deploy
   ```

   Or, if you're developing and need to create a new migration:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the Redis server** (if running locally):
   ```bash
   # On macOS/Linux:
   redis-server
   
   # On Windows (if installed via WSL or Docker):
   docker run -d -p 6379:6379 redis
   ```

7. **Create the uploads directory:**
   ```bash
   mkdir -p uploads logs
   ```

8. **Start the application:**

   **Development mode** (with auto-restart on file changes):
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   node app.js
   ```

   You should see:
   ```
   Server Running on: http(s)://127.0.0.1:3000/
   Redis connected successfully
   ```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT_NAME` | The port the Express server listens on | `3000` |
| `HOST_NAME` | The host address the server binds to | `127.0.0.1` or `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/db_name` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `BASE_URL` | Base URL for constructing file URLs in responses | `http://localhost:3000` |

### Testing the Application

1. **Submit an application using cURL:**
   ```bash
   curl -X POST http://localhost:3000/api/applications \
     -F "firstName=John" \
     -F "lastName=Doe" \
     -F "email=john@example.com" \
     -F "phone=+12025551234" \
     -F "location=New York" \
     -F "resume=@/path/to/resume.pdf"
   ```

2. **Or use Postman:**
   - Create a new POST request to `http://localhost:3000/api/applications`
   - Select **Body → form-data**
   - Add the fields as shown above, and select "File" type for the resume field
   - Click **Send**

3. **View logs:**
   - Check the console output for real-time logs
   - Check `logs/app.log` for all events
   - Check `logs/error.log` for error-specific logs

4. **Download a resume:**
   - Use the `resume_url` from the application response
   - Example: `http://localhost:3000/uploads/1620000000000-resume.pdf`

### Troubleshooting

**"Cannot find module" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database connection error:**
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check DATABASE_URL is correct in `.env`
- Ensure the database exists: `psql -U postgres -l | grep candidate_pipeline`

**Redis connection error:**
- Verify Redis is running: `redis-cli ping` (should return `PONG`)
- Check REDIS_URL is correct in `.env`

**Port already in use:**
- Change PORT_NAME in `.env` to an available port
- Or kill the process using the port:
  ```bash
  # Find the process using port 3000
  lsof -i :3000
  # Kill it (replace PID with the actual process ID)
  kill -9 <PID>
  ```

### Development Workflow

1. **Make code changes** — Files in `src/` will be automatically watched and reloaded if using `npm run dev`

2. **Add database fields** — Edit `prisma/schema.prisma`, then run:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```

3. **Update validation rules** — Edit `src/validators/application_validator.js` to add new required fields

4. **Monitor logs** — Watch `logs/app.log` to see real-time events and errors

5. **Test the API** — Use Postman or cURL to submit applications and verify responses

---

## Next Steps

To extend this system, consider:

- Adding authentication for recruiter access to view applications
- Building a dashboard to filter and manage applications by status
- Implementing email templates and customizable email content
- Adding search and filtering capabilities to list applications
- Implementing webhooks to integrate with external recruitment systems
- Adding rate limiting to prevent abuse
- Setting up SMS notifications for applicants
- Creating an admin panel for status updates and candidate notes
