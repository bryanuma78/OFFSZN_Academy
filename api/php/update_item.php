<?php
include 'db.php';
$id = $_POST['id'];
$titulo = $_POST['titulo'];
$precio = $_POST['precio'];
$descuento = $_POST['descuento'];
$descripcion = $_POST['desc'];

$sql = "UPDATE items SET titulo='$titulo', precio='$precio', descuento='$descuento', descripcion='$descripcion'";

if(isset($_FILES['img'])){
    $imagen = 'uploads/' . time() . '_' . $_FILES['img']['name'];
    move_uploaded_file($_FILES['img']['tmp_name'], $imagen);
    $sql .= ", imagen='$imagen'";
}

if(isset($_FILES['video'])){
    $video = 'uploads/' . time() . '_' . $_FILES['video']['name'];
    move_uploaded_file($_FILES['video']['tmp_name'], $video);
    $sql .= ", video='$video'";
}

$sql .= " WHERE id='$id'";
echo json_encode($conn->query($sql) ? ['success'=>true] : ['success'=>false,'error'=>$conn->error]);
?>
