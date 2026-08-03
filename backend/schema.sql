-- MySQL Schema for Auditorium Booking & GPS Attendance System
-- Database name: auditorium_db

CREATE DATABASE IF NOT EXISTS auditorium_db;
USE auditorium_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL
);

-- Seed Default Admin Credentials (username: admin, password: admin123)
INSERT INTO users (id, username, password, name) 
VALUES ('user_1', 'admin', 'admin123', 'System Admin')
ON DUPLICATE KEY UPDATE username=username;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

-- Seed Default Departments
INSERT INTO departments (id, name) VALUES 
('dept_1', 'IT'),
('dept_2', 'CSE'),
('dept_3', 'ECE'),
('dept_4', 'Mechanical')
ON DUPLICATE KEY UPDATE name=name;

-- 3. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    departmentId VARCHAR(50),
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE
);

-- Seed Default Faculty Members
INSERT INTO faculty (id, name, email, mobile, departmentId) VALUES 
('faculty_1', 'Dr. Rajesh Kumar', 'rajesh.kumar@example.com', '+91 9876543210', 'dept_1'),
('faculty_2', 'Prof. Vikram Singh', 'vikram.singh@example.com', '+91 9876543211', 'dept_1'),
('faculty_3', 'Dr. Neha Sharma', 'neha.sharma@example.com', '+91 9876543212', 'dept_2'),
('faculty_4', 'Prof. Amit Yadav', 'amit.yadav@example.com', '+91 9876543213', 'dept_2'),
('faculty_5', 'Prof. Anil Kumar', 'anil.kumar@example.com', '+91 9876543214', 'dept_3'),
('faculty_6', 'Dr. Priya Gupta', 'priya.gupta@example.com', '+91 9876543215', 'dept_3'),
('faculty_7', 'Prof. Radhika Joshi', 'radhika.joshi@example.com', '+91 9876543216', 'dept_4'),
('faculty_8', 'Dr. Kiran Patel', 'kiran.patel@example.com', '+91 9876543217', 'dept_4')
ON DUPLICATE KEY UPDATE name=name;

-- 4. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'Active'
);

-- Seed Default Venues
INSERT INTO venues (id, name, capacity, location, address, latitude, longitude, radius, status) VALUES 
('venue_1', 'Hall A', 150, 'Block A, 2nd Floor', 'Kirti College Block A, Dadar, Mumbai', 19.02690000, 72.84220000, 50, 'Active'),
('venue_2', 'Hall B', 250, 'Block B, Ground Floor', 'Kirti College Block B, Dadar, Mumbai', 19.02720000, 72.84250000, 50, 'Active'),
('venue_3', 'Hall C', 500, 'Auditorium Complex', 'Kirti College Auditorium Complex, Dadar, Mumbai', 19.02750000, 72.84300000, 50, 'Active')
ON DUPLICATE KEY UPDATE name=name;

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    eventName VARCHAR(255) NOT NULL,
    departmentId VARCHAR(50),
    facultyId VARCHAR(50),
    venueId VARCHAR(50),
    eventDescription TEXT,
    bookingDate VARCHAR(50) NOT NULL, -- Stored as string YYYY-MM-DD to preserve React compatibility
    startTime VARCHAR(10) NOT NULL,
    endTime VARCHAR(10) NOT NULL,
    attendees INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    attendanceStatus VARCHAR(50) DEFAULT 'CLOSED',
    attendanceWindowStart VARCHAR(100),
    attendanceWindowEnd VARCHAR(100),
    coordinator VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(50),
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (facultyId) REFERENCES faculty(id) ON DELETE SET NULL,
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE SET NULL
);

-- Seed Initial Test Bookings
INSERT INTO bookings (id, eventName, departmentId, facultyId, venueId, eventDescription, bookingDate, startTime, endTime, attendees, status, attendanceStatus, attendanceWindowStart, attendanceWindowEnd, coordinator, email, phone) VALUES 
('booking_1', 'Web Development Workshop', 'dept_1', 'faculty_1', 'venue_1', 'A hands-on workshop covering Node.js and React concepts.', '2026-07-15', '10:00', '13:00', 120, 'Approved', 'CLOSED', NULL, NULL, 'Faculty Coordinator Dr. Rajesh Kumar', 'rajesh.kumar@example.com', '+91 9876543210'),
('booking_2', 'AI/ML Seminar', 'dept_2', 'faculty_3', 'venue_3', 'Guest lecture on future advancements in generative models.', '2026-07-20', '14:00', '16:00', 450, 'Pending', 'CLOSED', NULL, NULL, 'Dr. Neha Sharma', 'neha.sharma@example.com', '+91 9876543212')
ON DUPLICATE KEY UPDATE eventName=eventName;

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    bookingId VARCHAR(50) NOT NULL,
    rollNumber VARCHAR(100) NOT NULL,
    studentName VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    distanceFromVenue INT,
    checkInTime VARCHAR(100) NOT NULL,
    FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
);
