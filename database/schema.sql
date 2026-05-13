CREATE DATABASE IF NOT EXISTS ccrts_db;
USE ccrts_db;

CREATE TABLE IF NOT EXISTS roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE IF NOT EXISTS categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  assigned_agent_id INT,
  category_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('Low','Medium','High','Critical') DEFAULT 'Medium',
  status ENUM('Open','Assigned','In Progress','Pending Customer Response','Escalated','Resolved','Closed') DEFAULT 'Open',
  sla_deadline DATETIME,
  is_escalated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (customer_id) REFERENCES users(user_id),
  FOREIGN KEY (assigned_agent_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS complaint_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  updated_by INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  comment TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id),
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS attachments (
  attachment_id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id),
  FOREIGN KEY (customer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
