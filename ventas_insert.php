<?php
// api/ventas_insert.php — inserta una venta
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../conex.php';

// Sanitizar/validar
$id         = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$vendedor   = trim($_POST['vendedor'] ?? '');
$direccion  = trim($_POST['direccion'] ?? '');
$fechaventa = trim($_POST['fechaventa'] ?? '');

if ($id<=0 || $vendedor==='' || $direccion==='' || $fechaventa==='') {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Datos incompletos'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Prepared statement
$stmt = mysqli_prepare(
  $conexion,
  "INSERT INTO ventas (id, vendedor, direccion, fechaventa) VALUES (?, ?, ?, ?)"
);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>mysqli_error($conexion)], JSON_UNESCAPED_UNICODE);
  exit;
}
mysqli_stmt_bind_param($stmt, "isss", $id, $vendedor, $direccion, $fechaventa);

if (mysqli_stmt_execute($stmt)) {
  echo json_encode(['ok'=>true,'msg'=>'Insertado'], JSON_UNESCAPED_UNICODE);
} else {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>mysqli_error($conexion)], JSON_UNESCAPED_UNICODE);
}
mysqli_stmt_close($stmt);
