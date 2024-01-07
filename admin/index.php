<?php 
    $settings = require(__DIR__ . "/../settings.php");
    $base_uri = $settings['base_uri'] ?? "";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload File</title>
</head>
<body>
    <form action="<?php $base_uri ?>/admin/upload_file.php" method="post" id="upload_training_file_form">
        <input type="file" name="file" id="">
        <input type="submit" value="Upload">
    </form>

    <script src="<?php $base_uri ?>/assets/js/admin/main.js"></script>
</body>
</html>