CREATE DATABASE IF NOT EXISTS job_tracker;
USE job_tracker;

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(150) NOT NULL,
  role_title VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  status VARCHAR(50) DEFAULT 'Applied',
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
