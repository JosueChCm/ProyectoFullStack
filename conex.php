<?php
// conex.php — conexión MySQL
$conexion = mysqli_connect('127.0.0.1','root','','ventas2');
if (!$conexion) {
  http_response_code(500);
  die('Error al conectar: '.mysqli_connect_error());
}
mysqli_set_charset($conexion,'utf8mb4');
