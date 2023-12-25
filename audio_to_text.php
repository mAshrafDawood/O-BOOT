<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header( "Content-Type: application/json; charset=utf-8" );


if (!isset($_FILES['blob'])) {
    // The file was not uploaded successfully
    header('HTTP/1.1 400 Bad Request');
    exit();
}


$speech_dir = __DIR__ . "/speech";
$input_dir = $speech_dir . "/input";
$output_dir = $speech_dir . "/output";

// clean out old output files
$old_output = glob( $speech_dir . "/output/*.txt" );
foreach( $old_output as $file ) {
    if( filemtime( $file ) < time() - 60 * 5 ) {
        @unlink( $file );
    }
}

$id = uniqid( more_entropy: true );

$input_file = $input_dir . "/" . $id . ".webm";
$output_file = $output_dir . "/" . $id . ".txt";

$audio_blob = $_FILES['blob']['tmp_name'];

$write = move_uploaded_file($audio_blob, $input_file);


if( ! file_exists($input_file) ) {
    die( json_encode( [
        "status" => "ERROR",
        "response" => "Unable to write to input file",
    ] ) );
}

$speech_script = $speech_dir . "/generate_text.py";

$python_path = __DIR__ . "/venv/Scripts/python";

$settings = require( __DIR__ . "/settings.php" );

// exec( $python_path . " " . escapeshellarg( $speech_script ) . " " . escapeshellarg( $input_file ) . " " . escapeshellarg( $output_file ) . " " . escapeshellarg( $settings['api_key'] ), $output, $result_code );

exec( $python_path . " " . $speech_script . " " .$input_file . " " . $output_file . " " . $settings['api_key'], $output, $result_code );


if( ! file_exists( $output_file ) ) {
    die( json_encode( [
        "status" => "ERROR",
        "response" => "Unable to create output file",
        "output" => implode( "\n", $output ),
        "result_code" => $result_code
    ] ) );
}

$file_contents = file_get_contents($output_file);
$encoding = mb_detect_encoding($file_contents, 'UTF-8, ISO-8859-1', true);
$file_contents = mb_convert_encoding($file_contents, 'UTF-8', $encoding);


die(json_encode([
    'text' => $file_contents
]));


