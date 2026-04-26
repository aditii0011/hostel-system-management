const API = "http://localhost:5000";

const user = JSON.parse(localStorage.getItem("user"));
let wardInfo = null;

function firstDefinedValue(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return null;
}

function getWardDetails() {
    return {
        wardName: firstDefinedValue(wardInfo && wardInfo.name, user && user.wardName, user && user.name),
        studentId: firstDefinedValue(wardInfo && wardInfo.studentId, user && user.wardId, user && user.studentId),
        hostelName: firstDefinedValue(wardInfo && wardInfo.hostelName, user && user.hostelName),
        room: firstDefinedValue(wardInfo && wardInfo.room, wardInfo && wardInfo.roomNo, user && user.room, user && user.roomNo),
        studentPhone: firstDefinedValue(wardInfo && wardInfo.studentPhone, user && user.studentPhone),
        parentName: firstDefinedValue(wardInfo && wardInfo.parentName, user && user.name),
        parentPhone: firstDefinedValue(wardInfo && wardInfo.parentPhone, user && user.parentPhone, user && user.phone)
    };
}

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

async function loadWardInfo() {
    if (!user || !user.wardId) {
        console.warn('No ward ID available for parent user');
        return null;
    }

    try {
        const res = await fetch(`${API}/api/auth/student/${user.wardId}`);
        if (!res.ok) {
            console.error('Failed to fetch ward information');
            return null;
        }
        const ward = await res.json();
        wardInfo = ward;
        return ward;
    } catch (error) {
        console.error('Error loading ward information:', error);
        return null;
    }
}

function showDashboard(event){
    setActiveNav(event);
    const mainContent = document.querySelector('.main-content');
    const details = getWardDetails();

    const wardName = details.wardName || 'Not assigned';
    const hostelName = details.hostelName || 'Not assigned';
    const roomNumber = firstDefinedValue(details.room, 'Not assigned');

    mainContent.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Parent Dashboard</h1>
            <button class="btn btn-danger" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button>
        </div>
        <div class="row mb-4">
            <div class="col-md-4 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-person-circle"></i></div>
                        <h5 class="card-title">My Ward</h5>
                        <p class="card-text">${wardName}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-building"></i></div>
                        <h5 class="card-title">Hostel</h5>
                        <p class="card-text">${hostelName}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-door-open"></i></div>
                        <h5 class="card-title">Room</h5>
                        <p class="card-text">${roomNumber}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-calendar-plus"></i></div>
                        <h5 class="card-title">Request Leave</h5>
                        <p class="card-text">Submit a leave request for your ward</p>
                        <button onclick="showLeaveRequest(event)" class="btn btn-primary">
                            <i class="bi bi-plus-circle me-2"></i>Request Leave
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon"><i class="bi bi-clock-history"></i></div>
                        <h5 class="card-title">Leave History</h5>
                        <p class="card-text">View all past leave records</p>
                        <button onclick="showLeaveHistory(event)" class="btn btn-success">
                            <i class="bi bi-list-ul me-2"></i>View History
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="output" class="mt-4"></div>
    `;
}

function showLeaveRequest(event){
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Request Leave</h1>
        </div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card dashboard-card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-calendar-plus me-2"></i>Leave Application</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="from" class="form-label">From Date</label>
                            <input id="from" type="date" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label for="to" class="form-label">To Date</label>
                            <input id="to" type="date" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label for="reason" class="form-label">Reason (Optional)</label>
                            <textarea id="reason" class="form-control" rows="3" placeholder="Please provide a reason for the leave..."></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="file" class="form-label">Supporting Document (Optional)</label>
                            <input id="file" type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png">
                        </div>
                        <button onclick="sendLeave()" class="btn btn-primary w-100">
                            <i class="bi bi-send me-2"></i>Submit Leave Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="output" class="mt-4"></div>
    `;
}

function showLeaveHistory(event){
    setActiveNav(event);
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Leave History</h1>
            <button class="btn btn-sm btn-outline-light" onclick="loadLeaveHistory()"><i class="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>
        <div id="output"></div>
    `;
    loadLeaveHistory();
}

function showStudentInfo(event){
    setActiveNav(event);
    const details = getWardDetails();
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Student Information</h1>
        </div>
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card dashboard-card">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>Student Details</h5>
                    </div>
                    <div class="card-body text-white">
                        <div class="row">
                            <div class="col-md-6">
                                <p class="text-white"><strong>Name:</strong> ${details.wardName || 'Not available'}</p>
                                <p class="text-white"><strong>Student ID:</strong> ${details.studentId || 'Not available'}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="text-white"><strong>Hostel:</strong> ${details.hostelName || 'Not assigned'}</p>
                                <p class="text-white"><strong>Room:</strong> ${firstDefinedValue(details.room, 'Not assigned')}</p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <p class="text-white"><strong>Phone:</strong> ${details.studentPhone || 'Not available'}</p>
                            <p class="text-white"><strong>Parent Name:</strong> ${details.parentName || 'Not available'}</p>
                            <p class="text-white"><strong>Parent Contact:</strong> ${details.parentPhone || 'Not available'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="output" class="mt-4"></div>
    `;
}

window.addEventListener('load', async () => {
    await loadWardInfo();
    showDashboard();
});

// Load leave history of ward
async function loadLeaveHistory(){
    if(!user || !user.wardId){
        document.getElementById("output").innerHTML = '<div class="alert alert-warning">Ward information not available. Please verify your account has wardId.</div>';
        return;
    }

    try {
        const res = await fetch(`${API}/api/leave/parent/${user.wardId}`);
        const data = await res.json();

        if (!res.ok) {
            document.getElementById("output").innerHTML = '<div class="alert alert-danger">Unable to load leave history.</div>';
            return;
        }

        let html = '<div class="card"><div class="card-header"><h5>Leave Records</h5></div><div class="card-body">';

        if (data.length === 0) {
            html += '<div class="alert alert-info">No leave records found for your ward.</div>';
        } else {
            html += '<div class="table-responsive"><table class="table table-striped">';
            html += '<thead><tr><th>From Date</th><th>To Date</th><th>Status</th><th>Reason</th><th>Requested On</th></tr></thead><tbody>';

            data.forEach(l => {
                const statusBadge = getStatusBadge(l.status);
                const requestedDate = new Date(l.createdAt || Date.now()).toLocaleDateString();

                html += `<tr>
                    <td>${l.fromDate || 'N/A'}</td>
                    <td>${l.toDate || 'N/A'}</td>
                    <td>${statusBadge}</td>
                    <td>${l.reason || 'Not specified'}</td>
                    <td>${requestedDate}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';

            // Summary statistics
            const total = data.length;
            const approved = data.filter(l => l.status === 'APPROVED').length;
            const rejected = data.filter(l => l.status === 'REJECTED').length;
            const pending = data.filter(l => l.status === 'PENDING').length;

            html += `<div class="mt-3">
                <h6>Summary:</h6>
                <div class="row text-center">
                    <div class="col-md-3">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h5 class="text-primary">${total}</h5>
                                <small>Total Requests</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h5>${approved}</h5>
                                <small>Approved</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-danger text-white">
                            <div class="card-body">
                                <h5>${rejected}</h5>
                                <small>Rejected</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <h5>${pending}</h5>
                                <small>Pending</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        html += '</div></div>';
        document.getElementById("output").innerHTML = html;
    } catch (error) {
        console.error('Error loading leave history:', error);
        document.getElementById("output").innerHTML = '<div class="alert alert-danger">Network error. Please try again.</div>';
    }
}

function getStatusBadge(status) {
    switch(status) {
        case 'APPROVED':
            return '<span class="badge bg-success">Approved</span>';
        case 'REJECTED':
            return '<span class="badge bg-danger">Rejected</span>';
        case 'PENDING':
            return '<span class="badge bg-warning">Pending</span>';
        default:
            return '<span class="badge bg-secondary">' + status + '</span>';
    }
}

async function sendLeave(){
    const details = getWardDetails();
    const fromDate = document.getElementById("from").value;
    const toDate = document.getElementById("to").value;
    const reason = document.getElementById("reason").value;

    if(!fromDate || !toDate){
        alert("Please select both from and to dates.");
        return;
    }

    if(new Date(fromDate) > new Date(toDate)){
        alert("From date cannot be after to date.");
        return;
    }

    const body = {
        studentId: details.studentId || "",
        studentName: details.wardName || "Unknown Student",
        parentName: user.name || "Parent",
        room: firstDefinedValue(details.room, 0),
        hostelName: details.hostelName || "",
        fromDate: fromDate,
        toDate: toDate,
        reason: reason || "Not specified"
    };

    try {
        const res = await fetch(`${API}/api/leave/request`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            alert("Failed to submit leave request: " + errorText);
            return;
        }

        alert("Leave request submitted successfully! ✅");
        // Clear form
        document.getElementById("from").value = "";
        document.getElementById("to").value = "";
        document.getElementById("reason").value = "";
        document.getElementById("file").value = "";
    } catch (error) {
        console.error('Error submitting leave request:', error);
        alert("Network error. Please try again.");
    }
}
