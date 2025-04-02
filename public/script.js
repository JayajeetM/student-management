const BACKEND_URL = "https://student-management-ec9d.onrender.com"; // ✅ REPLACE THIS WITH YOUR ACTUAL RENDER URL

// Login Page
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch(`${BACKEND_URL}/api/login`, { // ✅ Fixed API URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = '/dashboard.html';
        } else {
            alert('Invalid credentials');
        }
    });
}

// Dashboard
if (document.querySelector('.dashboard-container')) {
    // Tab navigation
    const tabs = document.querySelectorAll('.sidebar li[data-tab]');
    const tabContents = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Load initial tab
    tabs[0].classList.add('active');
    tabContents[0].classList.add('active');

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    // Load data
    loadPersonalInfo();
    loadAcademics();
    loadFeeInfo();
    loadHostelInfo();
}

// Fetch and display personal information
async function loadPersonalInfo() {
    const response = await fetch(`${BACKEND_URL}/api/personal`); // ✅ Fixed API URL
    const data = await response.json();
    document.getElementById('personalInfo').innerHTML = `
        <p>Name: ${data.name}</p>
        <p>Age: ${data.age}</p>
        <p>Grade: ${data.grade}</p>
        <p>Email: ${data.email}</p>
    `;
}

// Fetch and display academics (exam results & attendance)
async function loadAcademics() {
    const attendanceRes = await fetch(`${BACKEND_URL}/api/attendance`); // ✅ Fixed API URL
    const attendance = await attendanceRes.json();
    document.getElementById('attendance').innerHTML = `<p>Attendance: ${attendance.percentage}%</p>`;

    const resultsRes = await fetch(`${BACKEND_URL}/api/results`); // ✅ Fixed API URL
    const results = await resultsRes.json();
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = results.map(r => `<tr><td>${r.subject}</td><td>${r.marks}</td></tr>`).join('');
}

// Fetch and display fee information
async function loadFeeInfo() {
    const response = await fetch(`${BACKEND_URL}/api/fees`); // ✅ Fixed API URL
    const data = await response.json();
    document.getElementById('feeInfo').innerHTML = `
        <p>Total Fees: $${data.total}</p>
        <p>Paid: $${data.paid}</p>
        <p>Due: $${data.due}</p>
    `;
}

// Fetch and display hostel information
async function loadHostelInfo() {
    const response = await fetch(`${BACKEND_URL}/api/hostel`); // ✅ Fixed API URL
    const data = await response.json();
    document.getElementById('hostelInfo').innerHTML = `
        <p>Room Number: ${data.room}</p>
        <p>Building: ${data.building}</p>
        <p>Status: ${data.status}</p>
    `;
}
