<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header( "Content-Type: application/json; charset=utf-8" );


if (!isset($_FILES['file'])) {
    // The file was not uploaded successfully
    header('HTTP/1.1 400 Bad Request');
    exit();
}

$file_contents = file_get_contents($_FILES['file']['tmp_name']);
$encoding = mb_detect_encoding($file_contents, 'UTF-8, ISO-8859-1', true);
$file_contents = mb_convert_encoding($file_contents, 'UTF-8', $encoding);
$json = json_decode($file_contents, true);
if($json === null) {
    die(json_encode(['This file format is not json']));
}

$upload_file = __DIR__ . "/../settings/gpt_identity.json";

if (file_exists($upload_file)) {
    @unlink($upload_file);
}

$write = move_uploaded_file($_FILES['file']['tmp_name'], $upload_file);

if (! file_exists($upload_file)) {
    header('HTTP/1.1 400 Bad Request');
    die( json_encode( [
        "status" => "ERROR",
        "response" => "Unable to write to input file",
    ] ) );
}

die(json_encode([
    'text' => $json
]));

