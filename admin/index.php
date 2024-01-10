<?php
$settings = require(__DIR__ . "/../settings.php");
$base_uri = $settings['base_uri'] ?? "";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="<?php echo $base_uri ?>/assets/css/admin/style.css">
    <title>Upload File</title>
</head>
<body>

    <img
        id="background-image"
        src="<?php echo $base_uri ?>/assets/media/background.jpg"
        alt="background-image"
    >

    <div class="header">
        <img
            id="on-passive-logo"
            src="<?php echo $base_uri ?>/assets/media/on-passive-logo.png"
            alt="on-passive-logo"
        >

        <img
            id="o-media-logo"
            src="<?php echo $base_uri ?>/assets/media/omedia-logo.png"
            alt="o-media-logo"
        >
    </div>

    <div class="floating-center-glass-container">
        <div id="status-container">
            Status: <span id="status">Pending file upload</span>
        </div>
        <form action="<?php echo $base_uri ?>/admin/upload_file.php" method="post" id="upload_training_file_form">
            <legend>Upload File</legend>
            <div class="input-container">
                <input type="file" name="file" id="file" />
                <label for="file"><strong>Choose a file</strong></label>
                <input type="submit" value="Upload" id="submit">
            </div>
        </form>
    </div>

    <script src="<?php echo $base_uri ?>/assets/js/admin/main.js"></script>
</body>
</html>
