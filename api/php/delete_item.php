<?php
include 'db.php';
$id = $_POST['id'];
$sql = "DELETE FROM items WHERE id='$id'";
echo json_encode($conn->query($sql) ? ['success'=>true] : ['success'=>false,'error'=>$conn->error]);
?>
