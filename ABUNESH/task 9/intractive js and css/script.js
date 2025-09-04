// script.js
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'abcd@g' && password === '12345678') {
        document.getElementById('photoContainer').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
    } else {
        document.getElementById('error').classList.remove('hidden');
    }
});
