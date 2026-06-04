# Techno Terminal - System Capabilities & Features Contract

This document provides a formal overview of the core capabilities, modules, and user workflows supported by the Techno Terminal STEM Education Center Management Platform.

---

## 1. Core Modules

### 1.1. CRM (Customer Relationship Management)
The CRM module acts as the central directory for students, parents, and staff, offering granular profile tracking and advanced search capabilities.
- **Workflow Highlights**:
  - Detailed student profile management with contact information, emergency details, parent linkages, and enrollment status.
  - Parent contact directories linked directly to students for billing and notification routing.
  - Advanced search and filtering tools for quickly locating individuals by name, contact details, status, or tag.
  - Waiting list tracking and status lifecycle management for onboarding prospective students.

### 1.2. Academics & Course Administration
This module coordinates the center's educational offerings, standardizing course structures, scheduling, and learning progression tracks.
- **Workflow Highlights**:
  - Course curriculum creation with support for different academic tiers, levels, and prerequisites.
  - Group scheduling and directory listing, allowing students to be grouped by level, day, time, or assigned instructor.
  - Enriched class session planning, mapping out future academic years with defined time slots and capacities.

### 1.3. Student Enrollments
Facilitates onboarding, migrating, and offboarding students across different courses, tiers, and class groups with automatic conflict resolution.
- **Workflow Highlights**:
  - Seamless group-to-group migrations with automated conflict checking for schedules and pricing tiers.
  - Enforcing seat limits and waitlist triggers to avoid overbooking class sessions.
  - Historical auditing of enrollment transitions and status logs.

### 1.4. Attendance Tracking
Streamlines the tracking and verification of student attendance across all class sessions with automated alerts.
- **Workflow Highlights**:
  - Easy-to-use digital attendance sheets for instructors to record attendance, absences, and make notes.
  - Automatic dashboard widgets summarizing attendance rates per group or per student.
  - Linking attendance records directly to notification triggers (e.g., alert parents on absent status).

### 1.5. Finance & Billing
Provides robust financial accounting, tracking income, invoice generation, receipts search, and debtor management.
- **Workflow Highlights**:
  - Dynamic invoice creation, discount processing, and payment recording.
  - Receipt generation, ledger entries, and historical receipt search capabilities matching backend database records.
  - Automated debtor tracking, highlighting unpaid student balances and identifying the top debtors.
  - Session-based instructor payout calculations and class-hour verification.

### 1.6. Competitions & Team Management
Coordinates external and internal competitions, tracking team formation, registrations, and student accomplishments.
- **Workflow Highlights**:
  - Competition event creation, registration management, and scheduling.
  - Team assignment workflows, mapping students and coaches to designated teams.
  - Historical records of competition performance, medals, and achievement tracking.

### 1.7. HR & Staff Management
Manages staff accounts, roles, access levels, and active work assignments across the center.
- **Workflow Highlights**:
  - Directory of all employees, including instructors, administrative personnel, and system admins.
  - Secure credential management and profile activation/deactivation workflows.
  - Workload assignment and teaching schedule integration.

### 1.8. Analytics & BI Reports
Generates business intelligence, highlighting financial health, student retention, growth trends, and operation metrics.
- **Workflow Highlights**:
  - Daily business dashboards showing active student counts, today's payments, and upcoming schedules.
  - Detailed analytical reports summarizing monthly and weekly growth.
  - Interactive charts visualizing financial collections and performance indicators.

### 1.9. Notification Engine
Handles automated messaging, system alerts, and reports via SMTP Email and WhatsApp integration.
- **Workflow Highlights**:
  - Configurable notification templates with variable placeholders (e.g., student name, balance due).
  - Background dispatch queue for parent alerts, enrollment confirmations, and payment receipts.
  - Daily, weekly, and monthly business reports containing session attendance per instructor, list of payments, unpaid students, and top debtors.

### 1.10. Authentication & Security
Ensures secure platform access, role separation, and session management using advanced authentication flows.
- **Workflow Highlights**:
  - Multi-Factor Authentication (MFA) enrollment and status tracking on user profiles.
  - Role-based route protection separating administrators, system administrators, and instructors.
  - Security audit triggers, including real-time administrative login notifications.

---

## 2. Role-Based Access Control (RBAC)

The system enforces strict permission levels based on user roles:
- **System Administrators**: Full system configuration, database access, settings customization, user invitations, and security log reviews.
- **Administrators**: Complete access to business modules (CRM, Finance, HR, Enrollments, Analytics, Notifications) to manage daily operations.
- **Instructors**: Read/write access limited to Academics, Attendance, Teams, and Competitions. Blocked from administrative settings, finance pages, and overall reports.
