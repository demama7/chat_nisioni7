const socket = io();
let userName = localStorage.getItem('userName');

if (!userName) {
    window.location.href = '/register.html'; // Redirect to registration page
} else {
    // Inform the server about the new user
    socket.emit('new user', userName);
}

document.getElementById('sendMessageButton').addEventListener('click', async function() {
    var messageInput = document.getElementById('messageInput');
    var fileInput = document.getElementById('fileInput');
    var message = messageInput.value.trim();
    var file = fileInput.files[0];

    if (message || file) {
        var data = { userName: userName, message: message };

        if (file) {
            data.image = await readFileAsDataURL(file);
        }

        socket.emit('chat message', data);
        messageInput.value = '';
        fileInput.value = '';
    } else {
        alert('לא הוזנה הודעה או תמונה!');
    }
});

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(err) {
            reject(err);
        };
        reader.readAsDataURL(file);
    });
}

document.getElementById('logoutButton').addEventListener('click', function() {
    var confirmLogout = confirm("האם את בטוחה שברצונך להתנתק?");
    if (confirmLogout) {
        localStorage.removeItem('userName');
        socket.emit('logout');
        window.location.href = '/register.html';
    }
});

socket.on('chat message', function(messages) {
    var chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    messages.forEach(function(data) {
        var messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.id = data.id; // Set the message ID to the element
        messageElement.innerHTML = `
            <span>${data.userName}:</span> ${data.message || ''}
            ${data.image ? `<img src="${data.image}" alt="Image" style="max-width: 100%; height: auto; margin-top: 5px;" />` : ''}
            ${data.userName === userName ? `<button onclick="deleteMessage('${data.id}')">מחק</button>` : ''}
        `;
        chatMessages.appendChild(messageElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('user list', function(users) {
    var userList = document.getElementById('users');
    userList.innerHTML = ''; // Clear current user list
    users.forEach(function(user) {
        var listItem = document.createElement('li');
        listItem.textContent = user;
        userList.appendChild(listItem);
    });
});

function deleteMessage(messageId) {
    socket.emit('delete message', messageId);
}

socket.on('message deleted', function(messageId) {
    var messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.remove(); // Remove the message from the DOM
    }
});
