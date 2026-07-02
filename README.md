
# Security & Quality Assurance Pipeline

## Overview

This document outlines the security measures, testing protocols, and quality assurance workflows implemented for the Task Manager project. The objective is to ensure a secure, resilient, and production-ready application by integrating security practices directly into the development lifecycle.

## Security Workflow & Tools

### 1. API Testing & Validation

Tool: Postman
Purpose: Functional and security testing of all API endpoints, including registration, authentication (Login), CRUD operations, and validation of unauthorized access attempts and status codes.
Status: Implemented to ensure API reliability and logical security.

### 2. Secret Management

Tool: GitLeaks
Purpose: Automated scanning of the codebase to prevent hardcoded credentials (API keys, JWT secrets, database URIs) from being pushed to version control.
Status: Implemented to ensure repository hygiene and prevent unauthorized access.

### 3. Static Application Security Testing (SAST) & SCA

Tool: Snyk
Purpose: Analyzing the codebase and project dependencies to detect known vulnerabilities and insecure coding patterns.
Status: Integrated to enforce security standards and patch vulnerable packages.

### 4. Container Security

Tool: Trivy
Purpose: Scanning Docker images for vulnerabilities at the OS and application layer.
Status: Implemented to ensure that the containerized environment is secure and compliant with best practices.

### 5. Dynamic Application Security Testing (DAST)

Tool: OWASP ZAP
Purpose: Conducting automated security testing on the running API (runtime) to identify vulnerabilities that cannot be detected through static analysis.
Status: Used to validate API security under real-world conditions.

### 6. Hardening & Security Headers

Tool: Helmet.js
Purpose: Configuring HTTP response headers to protect the application from common web attacks such as Clickjacking and Cross-Site Scripting (XSS).
Status: Implemented on the Express backend server.

--

