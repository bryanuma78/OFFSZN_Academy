<?php
include 'db.php';
$tipo = $_GET['tipo'] ?? 'curso';
$sql = "SELECT * FROM items WHERE tipo='$tipo' ORDER BY id DESC";
$result = $conn->query($sql);
$items = [];
if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $items[] = $row;
    }
}
echo json_encode($items);
?>
