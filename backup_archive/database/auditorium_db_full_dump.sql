-- COMPLETE MYSQL DATABASE DUMP FOR AUDITORIUM_DB
-- Generated on: 2026-09-17T20:32:50.652Z
CREATE DATABASE IF NOT EXISTS auditorium_db;
USE auditorium_db;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` varchar(50) NOT NULL,
  `bookingId` varchar(50) NOT NULL,
  `rollNumber` varchar(100) NOT NULL,
  `studentName` varchar(150) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `distanceFromVenue` int DEFAULT NULL,
  `checkInTime` varchar(100) NOT NULL,
  `classStream` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288125648_03l9u', 'booking_1786285400152_1678', '111', 'tushal jadhav', '19.02690000', '72.84220000', 0, '2026-08-09T15:08:45.648Z', 'saohoshodah');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288176931_4pfl3', 'booking_1786285400152_1678', 'lnasln', 'lsdnjljdsl', '19.02690000', '72.84220000', 0, '2026-08-09T15:09:36.931Z', 'sdnlnds');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288191815_u1yzc', 'booking_1786285400152_1678', 'asa', 'sjnsljnsdjan', '19.02690000', '72.84220000', 0, '2026-08-09T15:09:51.815Z', 'aknskjab');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288201599_6x1n6', 'booking_1786285400152_1678', 'd', 'da', '19.02690000', '72.84220000', 0, '2026-08-09T15:10:01.599Z', 'a');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288211952_glkfe', 'booking_1786285400152_1678', 's', 'd', '19.02690000', '72.84220000', 0, '2026-08-09T15:10:11.952Z', 'fa');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288222755_4x5uu', 'booking_1786285400152_1678', 'fg', 'gf', '19.02690000', '72.84220000', 0, '2026-08-09T15:10:22.755Z', 'g');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288231883_pqo3i', 'booking_1786285400152_1678', 'v', 'gdd', '19.02690000', '72.84220000', 0, '2026-08-09T15:10:31.883Z', 'v');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288242400_ckf7a', 'booking_1786285400152_1678', 'nbv', 'hhg', '19.02690000', '72.84220000', 0, '2026-08-09T15:10:42.400Z', 'gh');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288252201_nuhai', 'booking_1786285400152_1678', 'vbc', ',nb', '19.02690000', '72.84220000', 0, '2026-08-09T15:10:52.201Z', 'bv');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288271473_1iw5u', 'booking_1786285400152_1678', 'cbc', ',nv', '19.02690000', '72.84220000', 0, '2026-08-09T15:11:11.473Z', 'bv');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288281217_fyguv', 'booking_1786285400152_1678', 'vx', 'nc', '19.02690000', '72.84220000', 0, '2026-08-09T15:11:21.217Z', 'v');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288291634_9a7yd', 'booking_1786285400152_1678', 'gd', 'mbv', '19.02690000', '72.84220000', 0, '2026-08-09T15:11:31.634Z', 'cb');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288303111_r4gm4', 'booking_1786285400152_1678', 'b', 'bv', '19.02690000', '72.84220000', 0, '2026-08-09T15:11:43.111Z', 'gb');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288313695_pmq7t', 'booking_1786285400152_1678', 'fdgb', 'mvbdg', '19.02690000', '72.84220000', 0, '2026-08-09T15:11:53.695Z', 'gdv');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288335767_cmhc5', 'booking_1786285400152_1678', 'sdfc', 'dsc x', '19.02690000', '72.84220000', 0, '2026-08-09T15:12:15.767Z', 'sfdc');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288345814_xq9uj', 'booking_1786285400152_1678', 'gt', 'gfscv', '19.02690000', '72.84220000', 0, '2026-08-09T15:12:25.814Z', 'fbv');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288357003_j0ju9', 'booking_1786285400152_1678', 'dgh', 'yhgb', '19.02690000', '72.84220000', 0, '2026-08-09T15:12:37.003Z', 'ghd');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288368727_ccpba', 'booking_1786285400152_1678', 'fhg', 'jryb', '19.02690000', '72.84220000', 0, '2026-08-09T15:12:48.727Z', 'gb');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288382417_s8hbf', 'booking_1786285400152_1678', 'r', 'dv', '19.02690000', '72.84220000', 0, '2026-08-09T15:13:02.417Z', 'vgr');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288563648_1rp81', 'booking_1786285400152_1678', 'ss', 'sdx', '19.02690000', '72.84220000', 0, '2026-08-09T15:16:03.648Z', 'dsa');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288576104_1co5a', 'booking_1786285400152_1678', 'ljk', 'dsds', '19.02690000', '72.84220000', 0, '2026-08-09T15:16:16.104Z', 'd');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288586445_n79b1', 'booking_1786285400152_1678', 'jh', 'jhakjb', '19.02690000', '72.84220000', 0, '2026-08-09T15:16:26.445Z', 'jhj');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288601388_40udn', 'booking_1786285400152_1678', 'jbkj', 'jkbkskb', '19.02690000', '72.84220000', 0, '2026-08-09T15:16:41.388Z', 'dksbn');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288613176_cez04', 'booking_1786285400152_1678', 'nsnkj', 'dksdjn', '19.02690000', '72.84220000', 0, '2026-08-09T15:16:53.176Z', 'ksdjn');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288625454_pym65', 'booking_1786285400152_1678', 'knsdknjds', 'dsknskdjn', '19.02690000', '72.84220000', 0, '2026-08-09T15:17:05.454Z', 'dsljjnsdnj');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288639352_zm1mm', 'booking_1786285400152_1678', 'knsns', 'ljndsjnds', '19.02690000', '72.84220000', 0, '2026-08-09T15:17:19.352Z', 'ljnsjdjn');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288651179_qrpkh', 'booking_1786285400152_1678', 'j', 'skjb', '19.02690000', '72.84220000', 0, '2026-08-09T15:17:31.179Z', 'jh');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288665407_nm3az', 'booking_1786285400152_1678', 'nk', 'lnasl', '19.02690000', '72.84220000', 0, '2026-08-09T15:17:45.407Z', 'ln');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786288680132_z0d6w', 'booking_1786285400152_1678', 'ksdb', 'dsjkb', '19.02690000', '72.84220000', 0, '2026-08-09T15:18:00.132Z', 'ksj');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786289119116_yutjc', 'booking_1786285400152_1678', 'z', 'z', '19.02690000', '72.84220000', 0, '2026-08-09T15:25:19.116Z', 'z');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1786347093178_762j1', 'booking_1786346751472_3861', '11', 'tushal  jadhav', '19.02690000', '72.84220000', 0, '2026-08-10T07:31:33.178Z', 'TYBSC IT');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1788794856956_dgmav', 'booking_1786285400152_1678', 'ROLL_TEST_101', 'Aarav Mehta', '19.02690500', '72.84220500', 1, '2026-09-07T15:27:36.956Z', 'TYBSC IT');
INSERT INTO `attendance` (`id`, `bookingId`, `rollNumber`, `studentName`, `latitude`, `longitude`, `distanceFromVenue`, `checkInTime`, `classStream`) VALUES ('att_1788797019063_eafhl', 'booking_1788796719863_8851', 'LJN', 'sdvbdjdsgk', '19.06244856', '72.88730659', 1, '2026-09-07T16:03:39.063Z', 'kjbljhj');

DROP TABLE IF EXISTS `booking_audit_log`;
CREATE TABLE `booking_audit_log` (
  `id` varchar(50) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `admin_id` varchar(50) NOT NULL,
  `admin_name` varchar(150) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `reason` text NOT NULL,
  `previous_booking_snapshot` text,
  `new_booking_snapshot` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `eventName` varchar(255) NOT NULL,
  `departmentName` varchar(150) DEFAULT NULL,
  `facultyName` varchar(150) DEFAULT NULL,
  `venueId` varchar(50) DEFAULT NULL,
  `eventDescription` text,
  `bookingDate` varchar(50) NOT NULL,
  `startTime` varchar(10) NOT NULL,
  `endTime` varchar(10) NOT NULL,
  `attendees` int NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `attendanceStatus` varchar(50) DEFAULT 'CLOSED',
  `attendanceWindowStart` varchar(100) DEFAULT NULL,
  `attendanceWindowEnd` varchar(100) DEFAULT NULL,
  `coordinator` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `faculty` varchar(255) DEFAULT NULL,
  `classYear` varchar(100) DEFAULT NULL,
  `sessionLatitude` decimal(10,8) DEFAULT NULL,
  `sessionLongitude` decimal(11,8) DEFAULT NULL,
  `sessionPin` varchar(10) DEFAULT NULL,
  `sessionRadius` int DEFAULT '100',
  PRIMARY KEY (`id`),
  KEY `departmentId` (`departmentName`),
  KEY `facultyId` (`facultyName`),
  KEY `venueId` (`venueId`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`venueId`) REFERENCES `venues` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786285400152_1678', 'conexa ', 'dept_1786281626848', 'faculty_1786283366395', 'venue_1786281866713', 'slns', '2026-08-09', '20:05', '21:05', 429, 'Approved', 'CLOSED', NULL, NULL, 'Principal Tushal Jadhav', 'tushaljadhav@gmail.com', '+91 85918 11441', 'Information Technology (IT)', 'Tushal Jadhav', NULL, '19.02690000', '72.84220000', '5921', 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786346751472_3861', 'horizon ', 'dept_1786281626848', 'faculty_1786281723082', 'venue_1786281866713', 'bakxhaks', '2026-08-10', '17:00', '18:00', 103, 'Approved', 'CLOSED', NULL, NULL, 'Dr. Rajesh Kumar', 'rajesh.kumar@kirti.ac.in', '+91 98765 43210', 'Information Technology (IT)', 'Rajesh Kumar', NULL, NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786350191497_1993', 'sds', 'dept_1786281626848', 'faculty_1786281723082', 'venue_1786281962033', 'fdf', '2026-08-20', '14:00', '15:00', 55, 'Approved', 'CLOSED', NULL, NULL, 'Dr. Rajesh Kumar', 'rajesh.kumar@kirti.ac.in', '+91 98765 43210', 'Information Technology (IT)', 'Rajesh Kumar', NULL, NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786350238401_8740', 'af', 'dept_1786281626848', 'faculty_1786283260612', 'venue_1786281866713', 'fs', '2026-08-10', '15:05', '16:05', 32, 'Approved', 'CLOSED', NULL, NULL, 'Dr. Deepak Salunkhe', 'deepak.salunkhe@kirti.ac.in', '+91 98765 43220', 'Information Technology (IT)', 'Deepak Salunkhe', NULL, NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786350276869_6282', 'sds', 'dept_1786281626848', 'faculty_1786281723082', 'venue_1786281866713', 'sd', '2026-08-10', '18:00', '19:00', 107, 'Approved', 'CLOSED', NULL, NULL, 'Dr. Rajesh Kumar', 'rajesh.kumar@kirti.ac.in', '+91 98765 43210', 'Information Technology (IT)', 'Rajesh Kumar', NULL, NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786350603120_3778', 'asda', 'dept_1786281626848', 'faculty_1786281723082', 'venue_1786281866713', 'sdfsd', '2026-08-10', '19:00', '20:00', 38, 'Approved', 'CLOSED', NULL, NULL, 'Dr. Rajesh Kumar', 'rajesh.kumar@kirti.ac.in', '+91 98765 43210', 'Information Technology (IT)', 'Rajesh Kumar', NULL, NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786350671180_3257', 'adadad', 'dept_1786281626848', 'faculty_1786281723082', 'venue_1786281866713', 'ds', '2026-08-10', '20:00', '21:00', 65, 'Approved', 'CLOSED', NULL, NULL, 'Dr. Rajesh Kumar', 'rajesh.kumar@kirti.ac.in', '+91 98765 43210', 'Information Technology (IT)', 'Rajesh Kumar', NULL, NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786725416474_3167', 'skj', 'fsn', 'fskj', 'venue_1786281962033', 'wkb', '2026-08-14', '22:20', '23:00', 11, 'Approved', 'CLOSED', NULL, NULL, 'fskj', '', '', NULL, NULL, 'fdjkh', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1786726096322_9259', 'sd', 'faaf', 'adf', 'venue_1786281866713', 's', '2026-08-14', '22:30', '23:00', 11, 'Approved', 'CLOSED', NULL, NULL, 'adf', '', '', NULL, NULL, 'daff', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1787670433615_6733', 'dsjbkja', 'njkn', 'jnk', 'venue_1786281866713', 'nknj
', '2026-08-25', '20:50', '21:50', 11, 'Confirmed', 'CLOSED', NULL, NULL, 'jnk', '', '', NULL, NULL, 'jkjn', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1787671983051_2323', 'Seminar on Web Development', 'Information Technology', 'Dr. A. P. Sharma', 'venue_1786281866713', 'Introduction to HTML, CSS, JavaScript, React, and Vite development.', '2026-09-01', '10:00', '11:00', 120, 'Confirmed', 'CLOSED', NULL, NULL, 'Dr. A. P. Sharma', '', '', NULL, NULL, 'TYBSc IT', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1788796719863_8851', 'sd', 'ds', 'aad', 'venue_1786281866713', 'DS', '2026-09-07', '21:40', '23:00', 1, 'Confirmed', 'CLOSED', NULL, NULL, 'aad', '', '', NULL, NULL, 'ad', '19.06242370', '72.88732304', '2557', 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1788867157192_9969', 'sd', 'Information Technology', 'asd', NULL, 'Instant live session created by faculty. Room: lab 1', '2026-09-08', '17:02', '17:17', 60, 'Confirmed', 'CLOSED', NULL, NULL, 'asd', '', '', NULL, NULL, 'df', '19.07539430', '72.88003601', '3433', 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1789318261389_9772', 'sds', 'Information Technology (IT)', 's', 'venue_1786282955090', 'Reserved via Kirti Progressive Web App', '2026-09-14', '10:00', '12:00', 75, 'Confirmed', 'CLOSED', NULL, NULL, 's', '', '', NULL, NULL, '', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1789485963147_7813', 'sds', 'Information Technology', 'System Adminaa', 'venue_1786281866713', 'ad', '2026-09-17', '14:30', '17:00', 75, 'Confirmed', 'CLOSED', NULL, NULL, 'System Adminaa', 'thasbkabs@gmail.com', '8591811441', NULL, NULL, 'adad', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1789487179819_4056', 'AI Workshop 2026', 'Computer Science', 'Prof. Sharma', 'venue_1786281866713', '', '2026-09-18', '09:00', '11:00', 75, 'Confirmed', 'CLOSED', NULL, NULL, 'Prof. Sharma', '', '', NULL, NULL, '', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1789562657179_2931', 'jk', 'Information Technology', 'Rajesh Kumar', NULL, 'Instant live session created by faculty. Room: Auditorium', '2026-09-16', '18:14', '18:29', 60, 'Confirmed', 'CLOSED', NULL, NULL, 'Rajesh Kumar', '', '', NULL, NULL, '', '19.06242293', '72.88729198', '6667', 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1789567363803_5304', 'tdyfhg', 'Information Technology', 'Tushal Jadhav', 'venue_1786281913728', 'hjvb', '2026-09-17', '10:30', '15:00', 75, 'Confirmed', 'CLOSED', NULL, NULL, 'Tushal Jadhav', 'kjb@gmail.com', '8591811441', NULL, NULL, 'kn', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_1789673890415_5647', 'jsnn', 'Information Technology', 'Faculty (+91 5452246564)', 'venue_1786281962033', ',mn,mnal', '2026-09-18', '09:00', '11:00', 75, 'Confirmed', 'CLOSED', NULL, NULL, 'Faculty (+91 5452246564)', 'nkan@gmail.com', 'lnna', NULL, NULL, 'knkanj', NULL, NULL, NULL, 100);
INSERT INTO `bookings` (`id`, `eventName`, `departmentName`, `facultyName`, `venueId`, `eventDescription`, `bookingDate`, `startTime`, `endTime`, `attendees`, `status`, `attendanceStatus`, `attendanceWindowStart`, `attendanceWindowEnd`, `coordinator`, `email`, `phone`, `department`, `faculty`, `classYear`, `sessionLatitude`, `sessionLongitude`, `sessionPin`, `sessionRadius`) VALUES ('booking_instant_1788797507859_3942', 'Cyber Security Special Lecture', 'Information Technology', 'Prof. Rajesh Sharma', 'venue_1786281866713', 'Instant Session at Room 304', '2026-09-07', '21:41', '22:01', 45, 'Confirmed', 'CLOSED', NULL, NULL, 'Prof. Rajesh Sharma', '', '', NULL, NULL, 'TYBSc IT', NULL, NULL, '5678', 75);

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786281626848', 'Information Technology (IT)');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786281633591', 'Computer Science (CS)');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786281645888', 'Electronics & Telecommunication');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786281653734', 'Commerce & Management');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282031832', 'Bachelor of Mass Media (BMM / BAMMC)');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282040706', 'Bachelor of Management Studies (BMS)');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282046463', 'Artificial Intelligence & Data Science');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282051815', 'Biotechnology & Life Sciences');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282056431', 'Chemistry & Material Science');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282061959', 'Physics & Nanotechnology');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282067647', 'Accounting & Finance (BAF)');
INSERT INTO `departments` (`id`, `name`) VALUES ('dept_1786282074510', 'Banking & Insurance (BBI)');

DROP TABLE IF EXISTS `designations`;
CREATE TABLE `designations` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `designations` (`id`, `name`) VALUES ('desig_1', 'Dr.');
INSERT INTO `designations` (`id`, `name`) VALUES ('desig_1783431977548', 'HOD');
INSERT INTO `designations` (`id`, `name`) VALUES ('desig_2', 'Prof.');
INSERT INTO `designations` (`id`, `name`) VALUES ('desig_3', 'Mr.');
INSERT INTO `designations` (`id`, `name`) VALUES ('desig_4', 'Ms.');
INSERT INTO `designations` (`id`, `name`) VALUES ('desig_5', 'Mrs.');
INSERT INTO `designations` (`id`, `name`) VALUES ('desig_6', 'Principal');

DROP TABLE IF EXISTS `faculty`;
CREATE TABLE `faculty` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `departmentId` varchar(50) DEFAULT NULL,
  `designationId` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `facultyId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `facultyId` (`facultyId`),
  KEY `departmentId` (`departmentId`),
  KEY `fk_faculty_designation` (`designationId`),
  CONSTRAINT `faculty_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_faculty_designation` FOREIGN KEY (`designationId`) REFERENCES `designations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786281723082', 'Rajesh Kumar', 'rajesh.kumar@kirti.ac.in', '+91 98765 43210', 'dept_1786281626848', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282117696', 'Amit Yadav', 'amit.yadav@kirti.ac.in', '+91 98765 43213', 'dept_1786281633591', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282155845', 'Anil Kumar', 'anil.kumar@kirti.ac.in', '+91 98765 43214', 'dept_1786282046463', 'desig_2', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282200896', 'Priya Gupta', 'priya.gupta@kirti.ac.in', '+91 98765 43215', 'dept_1786282051815', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282278918', 'Radhika Joshi', 'radhika.joshi@kirti.ac.in', '+91 98765 43216', 'dept_1786282040706', 'desig_2', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282329039', 'Kiran Patel', 'kiran.patel@kirti.ac.in', '+91 98765 43217', 'dept_1786282031832', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282370672', 'Suresh Deshmukh', 'suresh.deshmukh@kirti.ac.in', '+91 98765 43218', 'dept_1786282056431', 'desig_2', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786282400464', 'Meenal Kulkarni', 'meenal.kulkarni@kirti.ac.in', '+91 98765 43219', 'dept_1786282067647', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786283177612', 'Anjali More', 'anjali.more@kirti.ac.in', '+91 98765 43221', 'dept_1786281633591', 'desig_2', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786283260612', 'Deepak Salunkhe', 'deepak.salunkhe@kirti.ac.in', '+91 98765 43220', 'dept_1786281626848', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786283294833', 'Sanjay Patil', 'sanjay.patil@kirti.ac.in', '+91 98765 43222', 'dept_1786281653734', 'desig_1', NULL, 'Pending', NULL);
INSERT INTO `faculty` (`id`, `name`, `email`, `mobile`, `departmentId`, `designationId`, `password`, `status`, `facultyId`) VALUES ('faculty_1786283366395', 'Tushal Jadhav', 'tushaljadhav@gmail.com', '+91 85918 11441', 'dept_1786281626848', 'desig_6', NULL, 'Pending', NULL);

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(50) NOT NULL,
  `recipientId` varchar(50) DEFAULT NULL,
  `recipientEmail` varchar(150) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reason` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `bookingId` varchar(50) DEFAULT NULL,
  `isRead` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `username`, `password`, `name`) VALUES ('user_1787670614550', 'admin', 'admin123', 'System Admin');
INSERT INTO `users` (`id`, `username`, `password`, `name`) VALUES ('user_master_dev', 'dev', '123', 'Tushal');

DROP TABLE IF EXISTS `venues`;
CREATE TABLE `venues` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `capacity` int NOT NULL,
  `location` varchar(255) NOT NULL,
  `address` text,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `radius` int DEFAULT '50',
  `status` varchar(50) DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `address`, `latitude`, `longitude`, `radius`, `status`) VALUES ('venue_1786281866713', 'Hall A (Seminar Hall)', 150, 'Block A, 2nd Floor', 'Kirti M. Doongursee College, Dadar (W), Mumbai - 400028', '19.02690000', '72.84220000', 50, 'Active');
INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `address`, `latitude`, `longitude`, `radius`, `status`) VALUES ('venue_1786281913728', 'Hall B (Conference Hall)', 250, 'Block B, Ground Floor', 'Kirti M. Doongursee College, Dadar (W), Mumbai - 400028', '19.02720000', '70.84250000', 50, 'Active');
INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `address`, `latitude`, `longitude`, `radius`, `status`) VALUES ('venue_1786281962033', 'Hall C (Main Auditorium Complex)', 500, 'Auditorium Building', 'Kirti M. Doongursee College, Dadar (W), Mumbai - 400028', '19.02750000', '72.84300000', 100, 'Active');
INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `address`, `latitude`, `longitude`, `radius`, `status`) VALUES ('venue_1786282865881', 'Audio-Visual Room (AV Room 1)', 100, 'Library Building, 1st Floor', 'Kirti M. Doongursee College Library Wing, Dadar (W), Mumbai - 400028', '19.02670000', '72.84200000', 50, 'Active');
INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `address`, `latitude`, `longitude`, `radius`, `status`) VALUES ('venue_1786282913817', 'Open Air Amphitheater', 800, 'Central Quadrangle Grounds', 'Kirti M. Doongursee College Main Campus Lawn, Dadar (W), Mumbai - 400028', '19.02780000', '72.84330000', 50, 'Active');
INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `address`, `latitude`, `longitude`, `radius`, `status`) VALUES ('venue_1786282955090', 'Digital Innovation Lab Auditorium', 180, 'IT Block, 3rd Floor', 'Kirti M. Doongursee College IT Block, Dadar (W), Mumbai - 400028', '19.02700000', '72.84230000', 50, 'Active');

SET FOREIGN_KEY_CHECKS = 1;
