<!DOCTYPE html>
<html>
<head>
    <title>Home Monitoring System</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; }
        .camera-feed { width: 640px; height: 360px; border: 2px solid black; margin: 20px auto; }
    </style>
</head>
<body>
    <h1>Home Monitoring System</h1>
    <div>
        <label for="camera-url">Camera Stream URL:</label>
        <input type="text" id="camera-url" placeholder="Enter RTSP URL" />
        <button onclick="loadCamera()">Load Stream</button>
    </div>
    <video id="camera-feed" class="camera-feed" controls autoplay></video>

    <script>
        function loadCamera() {
            const video = document.getElementById('camera-feed');
            const url = document.getElementById('camera-url').value;
            if (url) {
                video.src = url;
            } else {
                alert("Please enter a valid camera URL");
            }
        }
    </script>
</body>
</html>
