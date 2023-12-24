<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header( "Content-Type: application/json; charset=utf-8" );

if (!isset($_POST['blob'])) {
    // The file was not uploaded successfully
    die(json_encode($_POST));
    header('HTTP/1.1 400 Bad Request');
    exit();
}

$blobData = $_POST['file'];

$speech_dir = __DIR__ . "\\speech";
$input_dir = $speech_dir . "\\input";
$output_dir = $speech_dir . "\\output";

// clean out old output files
$old_output = glob( $speech_dir . "\\output\\*.txt" );
foreach( $old_output as $file ) {
    if( filemtime( $file ) < time() - 60 * 5 ) {
        @unlink( $file );
    }
}

$id = uniqid( more_entropy: true );

$input_file = $input_dir . "\\" . $id . ".wav";
$output_file = $output_dir . "\\" . $id . ".txt";

die(json_encode([
    'content' => $blobData
]));

// Move the file to the upload directory
file_put_contents($input_file, $blobData);

if( $write === false ) {
    die( json_encode( [
        "status" => "ERROR",
        "response" => "Unable to write to input file",
    ] ) );
}

$speech_script = $speech_dir . "/generate_text.py";

$python_path = __DIR__ . "\\venv\\Scripts\\python";

$settings = require( __DIR__ . "/settings.php" );

exec( $python_path . " " . escapeshellarg( $speech_script ) . " " . escapeshellarg( $input_file ) . " " . escapeshellarg( $output_file ) . " " . escapeshellarg( $settings['api_key'] ), $output, $result_code );

unlink( $input_file );

if( ! file_exists( $output_file ) ) {
    die( json_encode( [
        "status" => "ERROR",
        "response" => "Unable to create output file",
        "output" => implode( "\n", $output ),
        "result_code" => $result_code,
    ] ) );
}


die(json_encode([
    'text' => $output
]));


