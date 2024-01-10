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
$allowed = true;
$counter = 0;
if (!is_null($json)){
    foreach ($json as $key => $value) {
        if ($key != $counter) {
            $allowed = false;
            break;
        }
        if (!is_string($value)) {
            $allowed = false;
            break;
        }
        $counter++;
    }
} else {
    $allowed = false;
}

if(!$allowed) {
    header('HTTP/1.1 400 Bad Request');
    die(json_encode([
        "status" => "ERROR",
        "response" => "Input file must be a valid json in a specific format",
    ]));
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

ini_set('session.gc_max_lifetime', 0);
ini_set('session.gc_probability', 1);
ini_set('session.gc_divisor', 1);

die(json_encode([
    'status' => "SUCCESS",
    'text' => $json
]));

