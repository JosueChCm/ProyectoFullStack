<?php
// api/ventas_list.php — lista ventas en JSON
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../conex.php';

$rows = [];
$sql  = "SELECT id, vendedor, direccion, fechaventa FROM ventas ORDER BY id DESC";
if ($res = mysqli_query($conexion, $sql)) {
  while ($r = mysqli_fetch_assoc($res)) $rows[] = $r;
  echo json_encode(['ok'=>true,'data'=>$rows], JSON_UNESCAPED_UNICODE);
} else {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>mysqli_error($conexion)], JSON_UNESCAPED_UNICODE);
}
