CREATE DATABASE library_db;
USE library_db;

CREATE TABLE books (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(100),
  copies INT DEFAULT 1
);

CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  branch VARCHAR(50)
);

CREATE TABLE issue_records (
  issue_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT,
  student_id INT,
  issue_date DATE,
  due_date DATE,
  return_date DATE,
  fine INT DEFAULT 0
);
