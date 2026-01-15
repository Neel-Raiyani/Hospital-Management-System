# Hospital Management System (Backend)

## Project Overview
The **Hospital Management System (HMS)** is a backend-only, microservice-based application designed to manage hospital operations efficiently. It handles **patients, doctors, appointments, checkups, lab tests, and prescriptions** in a secure, standardized, and scalable manner.

Key Features:
- Role-based access control (Admin, Doctor, Receptionist, Lab)
- Appointment booking within doctor’s OPD hours
- Doctor checkups with diagnosis and next follow-up
- Lab test management with PDF report uploads
- Prescription management with structured medicine details
- Follow-up handling for patient revisits
- Strict appointment status transitions
- JWT-based authentication

**Tech Stack:**
- Node.js + Express.js
- TypeScript
- MongoDB with Prisma ORM
- REST APIs
- Microservices architecture
- Environment-based configuration using `.env`

---

## Microservices Overview

| Service | Responsibility | Models |
|---------|----------------|--------|
| **Auth Service** | Manages users (Admin, Doctor, Receptionist, Lab), authentication, and role-based access | User, Doctor, Receptionist |
| **Patient Service** | Handles patient records (added by Receptionist only) | Patient |
| **Appointment Service** | Manages appointment booking, OPD queue, and status transitions | Appointment, OPD |
| **Checkup Service** | Stores doctor checkup details, diagnosis, and next checkup dates | Checkup |
| **Lab Service** | Handles lab test requests, uploads PDF reports, links reports to patients and appointments | LabTest, LabReport |
| **Prescription Service** | Manages prescriptions created by doctors, linked to appointments, with medicine details and instructions | Prescription |

**Roles & Responsibilities:**
- **ADMIN:** Creates users and manages profiles for doctors and receptionists.
- **RECEPTIONIST:** Registers patients, books appointments, can cancel appointments.
- **DOCTOR:** Performs checkups, creates prescriptions, updates appointment status.
- **LAB:** Views pending lab tests, uploads PDF reports, updates appointment status to `REVIEW`.

---

## System Flow

1. **Patient Registration & Appointment**
   - Receptionist adds patient and books appointment within doctor’s OPD time.
   - Patient receives a token number for OPD.
   - Initial appointment status: `WAITING`.

2. **Doctor Checkup**
   - Doctor performs checkup, records symptoms and diagnosis.
   - Doctor may suggest lab tests → status changes to `LAB_TESTS`.
   - Doctor can directly create prescription even if no lab tests are suggested.

3. **Lab Test Management**
   - Lab staff views pending lab tests (`LAB_TESTS` status).
   - Performs tests and uploads PDF reports.
   - Reports are linked to patient and appointment.
   - Lab staff manually updates appointment status to `REVIEW` after all tests are completed.

4. **Prescription Management**
   - Doctor creates prescription for the appointment (medicines + instructions).
   - Prescription linked to appointment.
   - Can export prescription as PDF.
   - Appointment remains `REVIEW` until doctor marks it `COMPLETED`.

5. **Follow-up & Review**
   - Patient revisits doctor → new appointment is created.
   - Doctor reviews previous lab reports and checkup.
   - Updates treatment or prescription if needed.
   - Follow-up status starts as `WAITING`.

---

## Appointment Status Flow

| Current Status | Allowed Next Status | Role Allowed |
|----------------|------------------|--------------|
| WAITING        | LAB_TESTS, COMPLETED, CANCELED | DOCTOR, RECEPTIONIST |
| LAB_TESTS      | REVIEW             | LAB (manual update after all tests) |
| REVIEW         | COMPLETED          | DOCTOR |
| COMPLETED      | —                  | — |
| CANCELED       | —                  | — |

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hospital-management-system.git
cd hospital-management-system
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
Create a .env file in the root of each service
.env.example is already present in each service for reference
```

### 4. Prisma setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the services (Each service has its own package.json. Start each service in separate terminals)
```bash
npm run dev
```

### 6. Access Swagger API documentation
```bash
http://localhost:<service-port>/api-docs
```

