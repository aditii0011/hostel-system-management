const API="http://localhost:5000";

const user = JSON.parse(localStorage.getItem("user"));

function showDashboard(){
    const nameEl = document.getElementById("studentName");
    const hostelEl = document.getElementById("studentHostel");
    const roomEl = document.getElementById("studentRoom");

    if(nameEl) nameEl.textContent = user?.name || user?.wardName || 'Student';
    if(hostelEl) hostelEl.textContent = user?.hostelName || 'Not assigned';
    if(roomEl) roomEl.textContent = user?.room || user?.roomNo || 'N/A';

    document.getElementById("output").innerHTML = `
        <div class="card dashboard-card p-4">
            <div class="card-body">
                <h5 class="card-title">Welcome back</h5>
                <p class="card-text text-secondary">Tap any action to review attendance, leave status or scan QR on the go.</p>
            </div>
        </div>
    `;
}

function goScan(){
    window.location = 'scan.html';
}

function showAttendance(event){
    if (event) {
        const section = event.target.closest('button');
        if (section) {
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            section.classList.add('active');
        }
    }
    loadAttendance();
}

function showLeave(event){
    if (event) {
        const section = event.target.closest('button');
        if (section) {
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            section.classList.add('active');
        }
    }
    loadLeave();
}

window.addEventListener('load', showDashboard);

// attendance history
async function loadAttendance(){
    if(!user || !user.studentId){
        document.getElementById("output").innerHTML = '<div class="alert alert-warning">Student ID is missing. Please log in again.</div>';
        return;
    }

    const res = await fetch(
        `${API}/api/attendance/student/${user.studentId}`
    );

    const data = await res.json();

    if(!res.ok){
        document.getElementById("output").innerHTML = '<div class="alert alert-danger">Unable to load attendance history.</div>';
        return;
    }

    if(!Array.isArray(data) || data.length === 0){
        document.getElementById("output").innerHTML = '<div class="alert alert-info">No attendance records found yet.</div>';
        return;
    }

    let html="<table class='table'>";
    html+="<tr><th>Date</th><th>Status</th></tr>";

    data.forEach(a=>{
        html+=`<tr>
        <td>${a.date}</td>
        <td>${a.status}</td>
        </tr>`;
    });

    html+="</table>";

    document.getElementById("output").innerHTML=html;

}


// leave history
async function loadLeave(){

    const res = await fetch(
        `${API}/api/leave/student/${user.studentId}`
    );

    const data = await res.json();

    let html="<table class='table'>";
    html+="<tr><th>From</th><th>To</th><th>Status</th></tr>";

    data.forEach(l=>{
        html+=`<tr>
        <td>${l.fromDate}</td>
        <td>${l.toDate}</td>
        <td>${l.status}</td>
        </tr>`;
    });

    html+="</table>";

    document.getElementById("output").innerHTML=html;

}
