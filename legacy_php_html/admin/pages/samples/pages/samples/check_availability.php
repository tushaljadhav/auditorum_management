<?php
// Database connection
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'booking_system';

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get POST data
$date = $_POST['date'];
$time = $_POST['time'];

// Query to check if the slot is available
$sql = "SELECT COUNT(*) as count FROM bookings WHERE date = ? AND time = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $date, $time);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$response = array();
$response['available'] = ($row['count'] == 0);

// Return JSON response
echo json_encode($response);

$stmt->close();
$conn->close();
?>
