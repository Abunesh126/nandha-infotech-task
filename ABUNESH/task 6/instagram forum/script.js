document.getElementById('message-btn').addEventListener('click', function(event) {
    event.preventDefault();
    var messageForm = document.getElementById('message-form');
    if (messageForm.style.display === 'none' || messageForm.style.display === '') {
        messageForm.style.display = 'block';
    } else {
        messageForm.style.display = 'none';
    }
});

document.getElementById('heart-btn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    var heartImg = document.getElementById('heart-img');
    if (heartImg.src.includes('heart.png')) {
        heartImg.src = 'red heartt.png'; // Change to the filled heart image
    } else {
        heartImg.src = 'heart.png'; // Change back to the empty heart image
    }
});
