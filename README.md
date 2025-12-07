# Application Tracking System

The Application Tracking System is a simple and clean tool designed to help users record, manage, and track all their job applications in one place. It includes a minimal login page, a dashboard with three main functions, and a table that displays all applications clearly.

---

## 🌟 Project Overview

This system allows users to:

- Add new job applications  
- Search for applications by company or role  
- View all applications in a structured table  
- Edit or delete applications  
- Navigate easily using a simple, clean interface  
- Exit back to the login page anytime  

Ideal for students, freshers, and job seekers.

---

## 🖥️ Features

### 1. Login Page
- Displays project title  
- Single Login button  
- Redirects to dashboard  

### 2. Dashboard
Contains three main cards:
- Search  
- Add Application  
- Applications List  

### 3. Panels
- **Search Panel**: Search by company or role  
- **Add Application Panel**:  
  - Company  
  - Role  
  - Location  
  - Status  
  - Applied Date  
  - Notes  
  - Save / Update actions  
- **Applications List Panel**:  
  - Shows all applications  
  - Edit and Delete options  

### 4. Exit Button
- Returns user to login page

---

## 🛠️ Technologies Used

### Frontend
- HTML  
- CSS  
- JavaScript  

### Backend
- Java (Simple HTTP Server using `com.sun.net.httpserver`)  
- JDBC (MySQL connection)  

### Database
- MySQL  
- Table name: `applications`

### Tools
- VS Code  
- Git  
- GitHub

- 
## 📁 Folder Structure

Application_Tracking/
└── Job_App/
├── SimpleHttpServer.java
├── DBHelper.java
├── database.sql
├── mysql-connector-java.jar
└── web/
├── index.html
├── style.css
├── script.js

---

## 🧪 How to Run the Project

### 1. Import Database
USE job_tracker;
SOURCE database.sql;


### 2. Compile Java Files
javac -cp ".;mysql-connector-java.jar" DBHelper.java SimpleHttpServer.java

### 3. Start the Server
java -cp ".;mysql-connector-java.jar" SimpleHttpServer


### 4. Open in Browser
http://localhost:8080

---

## 📌 Project Flow

1. Login Page  
2. Dashboard (3 cards)  
3. Search / Add / View Applications  
4. Exit to login  

---

## 👤 Author

**Sravani Dandu**  
Application Tracking System — 2024 Passout  

---

## 🎯 Purpose of the Project

This system helps job seekers manage and track all their job applications in one organized place.  
Useful for:
- Students  
- Freshers  
- Anyone applying to multiple companies  

A clean and effective job application management tool.

---

## 📁 Folder Structure

