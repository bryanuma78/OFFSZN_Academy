<?php
include 'db.php';
$tipo = $_POST['tipo'];
$titulo = $_POST['titulo'];
$precio = $_POST['precio'];
$descuento = $_POST['descuento'] ?? 0;
$descripcion = $_POST['desc'];

$imagen = '';
$video = '';

if(isset($_FILES['img'])){
    $imagen = 'uploads/' . time() . '_' . $_FILES['img']['name'];
    move_uploaded_file($_FILES['img']['tmp_name'], $imagen);
}

if(isset($_FILES['video'])){
    $video = 'uploads/' . time() . '_' . $_FILES['video']['name'];
    move_uploaded_file($_FILES['video']['tmp_name'], $video);
}

$sql = "INSERT INTO items (tipo,titulo,precio,descuento,imagen,video,descripcion) 
        VALUES ('$tipo','$titulo','$precio','$descuento','$imagen','$video','$descripcion')";

echo json_encode($conn->query($sql) ? ['success'=>true] : ['success'=>false,'error'=>$conn->error]);
?>
