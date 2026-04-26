const API="http://localhost:5000";

const user = JSON.parse(localStorage.getItem("user"));

function setActiveNav(event){
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (event && event.target) {
        const targetLink = event.target.closest('.nav-link');
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
}

function showDashboard(event){
    setActiveNav(event);
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Warden Dashboard</h1>
            <button class="btn btn-danger" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button>
        </div>
        <div class="row mb-4">
            <div class="col-md-3 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-people"></i></div>
                        <h5 class="card-title">My Hostel</h5>
                        <p class="card-text">${(user && user.hostelName) ? user.hostelName : 'Not assigned'}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-qr-code-scan"></i></div>
                        <h5 class="card-title">QR Code</h5>
                        <p class="card-text">Generate attendance QR</p>
                        <button onclick="generateQR()" class="btn btn-primary btn-sm mt-2"><i class="bi bi-qr-code me-1"></i>Generate</button>
                        <img id="qr" class="img-fluid d-none" alt="Attendance QR Code">
                        <p id="qrCodeText" class="small mt-2 mb-0 d-none"></p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-list-check"></i></div>
                        <h5 class="card-title">Attendance</h5>
                        <p class="card-text">View attendance by date</p>
                        <button onclick="showAttendance(event)" class="btn btn-success btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Open</button>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-person-lines-fill"></i></div>
                        <h5 class="card-title">Students</h5>
                        <p class="card-text">Manage hostel students</p>
                        <button onclick="showStudents(event)" class="btn btn-info btn-sm mt-2"><i class="bi bi-people me-1"></i>Open</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="output" class="mt-4"></div>
    `;
}

function showStudents(event){
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Students</h1>
            <button class="btn btn-sm btn-outline-light" onclick="loadStudents()"><i class="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>
        <div id="output"></div>
    `;
    loadStudents();
}
function showHostelChangeRequests(event) {
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Hostel Transfer Requests</h1>
            <button class="btn btn-sm btn-outline-light" onclick="loadHostelChangeRequests()"><i class="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>
        <div id="output"></div>
    `;
    loadHostelChangeRequests();
}

async function loadHostelChangeRequests() {
    if(!user || !user.hostelName) {
        document.getElementById("output").innerHTML = '<div class="alert alert-warning">Hostel is not assigned to warden. Please verify your account has hostelName.</div>';
        return;
    }

    const [studentsRes, hostelsRes, requestsRes] = await Promise.all([
        fetch(`${API}/api/auth/students/${encodeURIComponent(user.hostelName)}`),
        fetch(`${API}/api/hostel`),
        fetch(`${API}/api/auth/hostel-change-requests`)
    ]);

    const students = await studentsRes.json();
    const hostels = await hostelsRes.json();
    const requests = await requestsRes.json();

    const otherHostels = hostels.filter(h => h.hostelName !== user.hostelName).map(h => h.hostelName);

    let html = `<div class='card mb-4'><div class='card-header'><h5>Submit Transfer Request</h5></div><div class='card-body'>`;
    if (students.length === 0) {
        html += '<div class="alert alert-info">No students found in your hostel.</div>';
    } else if (otherHostels.length === 0) {
        html += '<div class="alert alert-warning">No other hostels are available for transfer.</div>';
    } else {
        html += `<table class='table table-striped'><thead><tr><th>Name</th><th>ID</th><th>Current Hostel</th><th>Requested Hostel</th><th>Action</th></tr></thead><tbody>`;
        students.forEach(s => {
            html += `
                <tr>
                    <td>${s.name || s.studentName || 'Unknown'}</td>
                    <td>${s.studentId || '-'}</td>
                    <td>${s.hostelName || '-'}</td>
                    <td>
                        <select id="request-hostel-${s._id}" class="form-select form-select-sm">
                            <option value="">Select hostel</option>
                            ${otherHostels.map(h => `<option value="${h}">${h}</option>`).join('')}
                        </select>
                    </td>
                    <td><button class="btn btn-primary btn-sm" onclick="submitHostelChangeRequest('${s._id}')">Request</button></td>
                </tr>`;
        });
        html += '</tbody></table>';
    }
    html += '</div></div>';

    const ownRequests = requests.filter(r => r.wardenId === (user && user._id));
    html += `<div class='card'><div class='card-header'><h5>My Transfer Requests</h5></div><div class='card-body'>`;
    if (ownRequests.length === 0) {
        html += '<div class="alert alert-secondary">No transfer requests submitted yet.</div>';
    } else {
        html += `<table class='table table-striped'><thead><tr><th>Student</th><th>Requested Hostel</th><th>Status</th><th>Admin Comment</th></tr></thead><tbody>`;
        ownRequests.forEach(r => {
            html += `
                <tr>
                    <td>${r.studentName || 'Unknown'}</td>
                    <td>${r.requestedHostel || '-'}</td>
                    <td>${r.status}</td>
                    <td>${r.adminComment || '-'}</td>
                </tr>`;
        });
        html += '</tbody></table>';
    }
    html += '</div></div>';

    document.getElementById('output').innerHTML = html;
}

async function submitHostelChangeRequest(studentId) {
    const select = document.getElementById(`request-hostel-${studentId}`);
    if (!select) return;
    const requestedHostel = select.value;
    if (!requestedHostel) {
        alert('Please choose a hostel to request.');
        return;
    }

    const res = await fetch(`${API}/api/auth/request-hostel-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            studentId,
            requestedHostel,
            wardenId: user && user._id,
            wardenName: user && user.name
        })
    });

    const data = await res.json();
    if (!res.ok) {
        alert(data.message || 'Unable to submit hostel change request.');
        return;
    }

    alert(data.message || 'Request submitted.');
    loadHostelChangeRequests();
}
function showRoom(event){
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Room View</h1>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-md-8">
                <input id="roomNo" class="form-control" placeholder="Room No">
            </div>
            <div class="col-md-4 d-flex align-items-center">
                <button onclick="loadRoom()" class="btn btn-info w-100">View Room Students</button>
            </div>
        </div>
        <div id="output"></div>
    `;
}

function showAttendance(event){
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Attendance</h1>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <input type="date" id="date" class="form-control">
            </div>
            <div class="col-md-6 d-flex align-items-center">
                <button onclick="loadAttendance()" class="btn btn-success w-100">Load Attendance</button>
            </div>
        </div>
        <div id="output"></div>
    `;
}

function showLeaves(event){
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Leave Requests</h1>
            <button class="btn btn-sm btn-outline-light" onclick="loadLeaves()"><i class="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>
        <div id="output"></div>
    `;
    loadLeaves();
}

window.addEventListener('load', showDashboard);

// student list
async function loadStudents(){

if(!user || !user.hostelName){
    document.getElementById("output").innerHTML = '<div class="alert alert-warning">Hostel is not assigned to warden. Please verify your account has hostelName.</div>';
    return;
}

const [studentsRes, hostelsRes] = await Promise.all([
    fetch(`${API}/api/auth/students/${encodeURIComponent(user.hostelName)}`),
    fetch(`${API}/api/hostel`)
]);

const students = await studentsRes.json();
const hostels = await hostelsRes.json();
const transferOptions = hostels
    .filter(h => h.hostelName !== user.hostelName)
    .map(h => `<option value="${h.hostelName}">${h.hostelName}</option>`)
    .join("");

let html = "<table class='table table-striped'>";
html += "<thead><tr><th>Name</th><th>ID</th><th>Current Room</th><th>Change Room</th><th>Transfer Hostel</th><th>Target Room</th><th>Actions</th></tr></thead><tbody>";

students.forEach(s=>{
    const studentName = s.name || s.wardName || s.studentName || "Unknown";
    const currentRoom = s.room || "-";

    html+=`<tr>
<td>${studentName}</td>
<td>${s.studentId || "-"}</td>
<td>${currentRoom}</td>
<td>
    <div class="input-group input-group-sm">
        <input id="edit-room-${s._id}" class="form-control" value="${s.room || ''}" placeholder="Room">
        <button class="btn btn-outline-success" onclick="updateStudentRoom('${s._id}')">Save</button>
    </div>
</td>
<td>
    <select id="transfer-hostel-${s._id}" class="form-select form-select-sm">
        <option value="">Choose hostel</option>
        ${transferOptions}
    </select>
</td>
<td>
    <input id="transfer-room-${s._id}" class="form-control form-control-sm" placeholder="Room">
</td>
<td>
    <button class="btn btn-primary btn-sm mb-1" onclick="submitHostelChangeRequest('${s._id}')">Transfer</button>
</td>
</tr>`;
});

html += "</tbody></table>";

    document.getElementById("output").innerHTML=html;
}

async function updateStudentRoom(studentId) {
    console.log('updateStudentRoom called with studentId:', studentId);
    const roomInput = document.getElementById(`edit-room-${studentId}`);
    console.log('roomInput element:', roomInput);
    if (!roomInput) {
        console.error('Room input not found for studentId:', studentId);
        return;
    }

    const room = roomInput.value.trim();
    console.log('Room value:', room);
    if (!room) {
        alert('Please enter a valid room number.');
        return;
    }

    const roomNumber = parseInt(room);
    console.log('Parsed room number:', roomNumber);
    if (isNaN(roomNumber)) {
        alert('Room must be a valid number.');
        return;
    }

    console.log('Updating room for student:', studentId, 'to room:', roomNumber);

    try {
        const res = await fetch(`${API}/api/auth/update-student/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: roomNumber })
        });

        console.log('Response status:', res.status);
        const msg = await res.text();
        console.log('Response message:', msg);

        if (!res.ok) {
            alert(msg || 'Unable to update room.');
            return;
        }

        alert('Room updated successfully.');
        loadStudents();
    } catch (error) {
        console.error('Error updating room:', error);
        alert('Network error. Please try again.');
    }
}

async function submitHostelChangeRequest(studentId) {
    const hostelSelect = document.getElementById(`transfer-hostel-${studentId}`);
    const roomInput = document.getElementById(`transfer-room-${studentId}`);
    if (!hostelSelect || !roomInput) return;

    const requestedHostel = hostelSelect.value;
    const requestedRoom = roomInput.value.trim();
    if (!requestedHostel) {
        alert('Please choose a hostel for transfer.');
        return;
    }
    if (!requestedRoom) {
        alert('Please enter the target room number for the new hostel.');
        return;
    }

    const res = await fetch(`${API}/api/auth/request-hostel-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            studentId,
            requestedHostel,
            requestedRoom,
            wardenId: user && user._id,
            wardenName: user && user.name
        })
    });

    const data = await res.json();
    if (!res.ok) {
        alert(data.message || 'Unable to submit transfer request.');
        return;
    }

    alert(data.message || 'Transfer request submitted.');
    loadStudents();
}

// generate QR (warden)
async function generateQR(){
    try {
        const res = await fetch(`${API}/api/qr/generate`);
        const data = await res.json();
        const qrImage = document.getElementById("qr");
        const qrCodeText = document.getElementById("qrCodeText");

        if (res.ok && data.qrImage && qrImage){
            qrImage.src = data.qrImage;
            qrImage.alt = data.code || "Attendance QR Code";
            qrImage.classList.remove("d-none");

            if (qrCodeText) {
                qrCodeText.textContent = data.code ? `Code: ${data.code}` : "";
                qrCodeText.classList.remove("d-none");
            }
            return;
        }

        document.getElementById("output").innerHTML = '<div class="alert alert-danger">Could not generate QR. Try again.</div>';
    } catch (error) {
        console.error("Error generating QR:", error);
        document.getElementById("output").innerHTML = '<div class="alert alert-danger">Unable to reach the QR service. Please check the backend connection.</div>';
    }
}

// attendance history
async function loadAttendance(){
const date=document.getElementById("date").value;

if(!date){
    document.getElementById("output").innerHTML = '<div class="alert alert-warning">Please select a date first.</div>';
    return;
}

if(!user || !user.hostelName){
    document.getElementById("output").innerHTML = '<div class="alert alert-warning">Hostel information is missing for this warden.</div>';
    return;
}

const res=await fetch(`${API}/api/attendance/date/${date}?hostel=${encodeURIComponent(user.hostelName)}`);
const data=await res.json();

if(!res.ok){
    document.getElementById("output").innerHTML = '<div class="alert alert-danger">Unable to load attendance for the selected date.</div>';
    return;
}

if(!Array.isArray(data) || data.length === 0){
    document.getElementById("output").innerHTML = '<div class="alert alert-info">No attendance records found for this date.</div>';
    return;
}

let html="<table class='table'>";
html+="<tr><th>Name</th><th>ID</th><th>Status</th></tr>";

data.forEach(a=>{
html+=`<tr>
<td>${a.studentName || '-'}</td>
<td>${a.studentId || '-'}</td>
<td>${a.status || '-'}</td>
</tr>`;
});

html+="</table>";

    document.getElementById("output").innerHTML=html;

}



// room details
async function loadRoom(){

if(!user || !user.hostelName){
    document.getElementById("output").innerHTML = '<div class="alert alert-warning">Hostel is not assigned to warden. Please verify your account has hostelName.</div>';
    return;
}

const room=document.getElementById("roomNo").value;

const res = await fetch(
`${API}/api/room/${user.hostelName}/${room}`
);

const data = await res.json();

let html="<h4>Room "+room+"</h4>";

html+="<table class='table'>";

html+="<tr><th>Name</th><th>ID</th><th>Phone</th></tr>";

data.forEach(s=>{

html+=`<tr>
<td>${s.name}</td>
<td>${s.studentId}</td>
<td>${s.studentPhone}</td>
</tr>`;

});

html+="</table>";

    document.getElementById("output").innerHTML=html;

}


// leaves
async function loadLeaves(){

const res=await fetch(`${API}/api/leave?hostel=${encodeURIComponent(user.hostelName)}`);
const data=await res.json();

let html="<table class='table'>";
html+="<tr><th>Name</th><th>From</th><th>To</th><th>Status</th><th>Action</th></tr>";

data.forEach(l=>{

const studentName = l.studentName || l.wardName || l.studentId || 'Unknown';

html+=`<tr>
<td>${studentName}</td>
<td>${l.fromDate}</td>
<td>${l.toDate}</td>
<td>${l.status}</td>

<td>
<button onclick="update('${l._id}','APPROVED')" class="btn btn-success btn-sm">Approve</button>
<button onclick="update('${l._id}','REJECTED')" class="btn btn-danger btn-sm">Reject</button>
</td>

</tr>`;

});

html+="</table>";

    document.getElementById("output").innerHTML=html;

}



async function update(id,status){

await fetch(`${API}/api/leave/update/${id}`,{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({status})

});

loadLeaves();

}
