const socket = io();
let userName = localStorage.getItem('userName');
let password = localStorage.getItem('password');

// Function to open modal
function openUsernameModal() {
    document.getElementById('usernameModal').style.display = 'block';
    
}



// Check if there is a username
if (!userName ) {
    openUsernameModal();
} else {
    // Notify server of new user
    socket.emit('new user', userName);
}

// בדיקת שם משתמש וסיסמה
if ( !password) {
    openUsernameModal();
} else {
    socket.emit('new user', {  password });
    
    document.getElementById("profilePassword").innerText = "****";
}




// פונקציה לפתיחת מודאל להזנת שם משתמש
function openUsernameModal() {
    document.getElementById('usernameModal').style.display = 'block';
}

// פונקציה לסגירת מודאל להזנת שם המשתמש
function closeUsernameModal() {
    document.getElementById('usernameModal').style.display = 'none';
}

// פונקציה לפתיחת תפריט פרופיל
function openProfileMenu() {
    document.getElementById('profileMenu').style.display = 'block';
}

// פונקציה לסגירת תפריט פרופיל
function closeProfileMenu() {
    document.getElementById('profileMenu').style.display = 'none';
}

// בדיקת שם משתמש וסיסמה
if (!userName || !password) {
    openUsernameModal();
} else {
    // מודיע לשרת על משתמש חדש
    socket.emit('new user', { userName, password });
    document.getElementById('profileUsername').innerText = userName;
    document.getElementById("profilePassword").innerText = "****";
    document.getElementById('openPassword').addEventListener("click", function () {
        document.getElementById("profilePassword").innerText = password;
    });
    document.getElementById('profileJoinDate').innerText = new Date().toLocaleDateString(); // תאריך הצטרפות לדוגמה
}

// טיפול בקליק על כפתור אישור במודאל להזנת שם משתמש וסיסמה
document.getElementById('submitUsername').addEventListener('click', function () {
    const enteredName = document.getElementById('usernameInput').value.trim();
    const enteredPassword = document.getElementById('passwordInput').value.trim();

    if (enteredName && enteredPassword) {
        userName = enteredName;
        password = enteredPassword;
        localStorage.setItem('userName', userName);
        localStorage.setItem('password', password);
        closeUsernameModal();
        socket.emit('new user', { userName, password });
        document.getElementById('profileUsername').innerText = userName;
        document.getElementById('openPassword').addEventListener("click", function () {
            document.getElementById("profilePassword").innerText = password;
        });
        document.getElementById('profileJoinDate').innerText = new Date().toLocaleDateString(); // תאריך הצטרפות לדוגמה
    } else {
        alert('אנא הכנס שם משתמש וסיסמה');
    }
});

// טיפול בקליק על כפתור פרופיל
document.getElementById('profileButton').addEventListener('click', function () {
    openProfileMenu();
});

// טיפול בקליק על כפתור סגירה בתפריט פרופיל
document.getElementById('closeProfileMenu').addEventListener('click', function() {
    document.getElementById("profilePassword").innerText = "****";
    document.getElementById('openPassword').addEventListener("click" , function(){
        document.getElementById("profilePassword").innerText = password;
    });
    closeProfileMenu();

});

// טיפול בקליק על כפתור אישור במודאל להזנת שם משתמש וסיסמה
document.getElementById('submitUsername').addEventListener('click', function() {
    const enteredName = document.getElementById('usernameInput').value.trim();
    const enteredPassword = document.getElementById('passwordInput').value.trim();

    if (enteredName && enteredPassword) {
        userName = enteredName;
        password = enteredPassword;
        localStorage.setItem('userName', userName);
        localStorage.setItem('password', password);
        closeUsernameModal();
        socket.emit('new user', { userName, password });
        document.getElementById('profileUsername').innerText = userName;
        document.getElementById('openPassword').addEventListener("click" , function(){
            document.getElementById("profilePassword").innerText = password;
        });
        document.getElementById('profileJoinDate').innerText = new Date().toLocaleDateString(); // תאריך הצטרפות לדוגמה
    } else {
        
    }
});




// טיפול בהודעות צ'אט מהשרת
socket.on('chat message', function(data) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `<span>${data.username}:</span> <p>${data.message}</p>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // גלילה אוטומטית לתחתית הצ'אט
});

// טיפול בהעלאת קבצים (תמונות)
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            socket.emit('chat image', { image: e.target.result });
        };
        reader.readAsDataURL(file);
    }
});

// טיפול בקבלת תמונות מהשרת
socket.on('chat image', function(data) {
    const chatMessages = document.getElementById('chatMessages');
    const imageElement = document.createElement('div');
    imageElement.className = 'chat-message';
    imageElement.innerHTML = `<span>${data.username}:</span> <img src="${data.image}" alt="Sent image" style="max-width: 200px; max-height: 200px;">`;
    chatMessages.appendChild(imageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // גלילה אוטומטית לתחתית הצ'אט
});

// טיפול בעדכון רשימת המשתמשים
socket.on('update users', function(users) {
    const usersList = document.getElementById('users');
    usersList.innerHTML = '';
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        usersList.appendChild(userItem);
    });
});

// טיפול בקליק על כפתור התנתקות
document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('userName');
    localStorage.removeItem('password');
    socket.emit('logout');
    window.location.reload();
});



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
        window.location.href = '/';
    }
});

// Display chat messages
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
            ${data.userName === userName ? `<button class="delete-message-button" data-id="${data.id}">מחק</button>` : ''}
        `;
        chatMessages.appendChild(messageElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Update user list
socket.on('user list', function(users) {
    var userList = document.getElementById('users');
    userList.innerHTML = ''; // Clear current user list
    users.forEach(function(user) {
        var listItem = document.createElement('li');
        listItem.textContent = user;
        userList.appendChild(listItem);
    });
});

// Event delegation for dynamically added delete buttons
document.getElementById('chatMessages').addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('delete-message-button')) {
        var messageId = event.target.getAttribute('data-id');
        deleteMessage(messageId);
    }
});

function deleteMessage(messageId) {
    socket.emit('delete message', messageId);
}

// Remove message from the DOM after deletion
socket.on('message deleted', function(messageId) {
    var messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.remove(); // Remove the message from the DOM
    }
});

// Modal handling
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('userName')) {
        document.getElementById('usernameModal').style.display = 'block';
    }
});

