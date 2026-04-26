console.log('admin.js loaded');

const API = "http://localhost:5000"; // Change this to your backend URL if different
let knownHostels = [];

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Load hostels
        const hostelRes = await fetch(`${API}/api/hostel`);
        const hostels = await hostelRes.json();
        document.getElementById("totalHostels").textContent = hostels.length;

        // Load users
        const userRes = await fetch(`${API}/api/auth/all`);
        const users = await userRes.json();
        const totalUsers = users.length;
        const totalWardens = users.filter(u => u.role === 'warden').length;

        document.getElementById("totalUsers").textContent = totalUsers;
        document.getElementById("totalWardens").textContent = totalWardens;
        document.getElementById("activeSessions").textContent = totalUsers; // Placeholder for active sessions

        // Update known hostels for dropdowns
        knownHostels = hostels.map(h => h.hostelName);
        updateHostelDropdowns(hostels);
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
    }
}

function updateHostelDropdowns(hostels) {
    const options = "<option value=\"\">Select Hostel</option>" +
        hostels.map(h => `<option value="${h.hostelName}">${h.hostelName}</option>`).join("");
    document.getElementById("whostel").innerHTML = options;
}

// Navigation functions
function setActiveNav() {
    // Remove active class from all nav links
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    // Add active class to clicked nav item
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // If no event (called programmatically), find and set the dashboard link as active
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        if (navLinks.length > 0 && navLinks[0].textContent.includes('Dashboard')) {
            navLinks[0].classList.add('active');
        }
    }
}

function showDashboard() {
    setActiveNav();
    // Hide all content sections and show dashboard
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('main-content element not found');
        return;
    }
    mainContent.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Dashboard</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="loadHostels()">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon">
                            <i class="bi bi-building"></i>
                        </div>
                        <h5 class="card-title">Total Hostels</h5>
                        <h2 id="totalHostels">-</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon">
                            <i class="bi bi-person-badge"></i>
                        </div>
                        <h5 class="card-title">Total Wardens</h5>
                        <h2 id="totalWardens">-</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon">
                            <i class="bi bi-people"></i>
                        </div>
                        <h5 class="card-title">Total Users</h5>
                        <h2 id="totalUsers">-</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stats-card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon">
                            <i class="bi bi-calendar-check"></i>
                        </div>
                        <h5 class="card-title">Active Sessions</h5>
                        <h2 id="activeSessions">-</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Management Cards -->
        <div class="row">
            <!-- Create Hostel -->
            <div class="col-md-6 mb-4">
                <div class="card dashboard-card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-plus-circle me-2"></i>Create Hostel</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="hostelName" class="form-label">Hostel Name</label>
                            <input id="hostelName" class="form-control" placeholder="Enter hostel name" required>
                        </div>
                        <div class="mb-3">
                            <label for="rooms" class="form-label">Total Rooms</label>
                            <input id="rooms" type="number" class="form-control" placeholder="Enter total rooms" required>
                        </div>
                        <div class="mb-3">
                            <label for="beds" class="form-label">Beds Per Room</label>
                            <input id="beds" type="number" class="form-control" placeholder="Enter beds per room" required>
                        </div>
                        <button onclick="createHostel()" class="btn btn-primary w-100">
                            <i class="bi bi-check-circle me-2"></i>Create Hostel
                        </button>
                    </div>
                </div>
            </div>

            <!-- Create Warden -->
            <div class="col-md-6 mb-4">
                <div class="card dashboard-card">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="bi bi-person-plus me-2"></i>Create Warden</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="wname" class="form-label">Name</label>
                            <input id="wname" class="form-control" placeholder="Enter warden name" required>
                        </div>
                        <div class="mb-3">
                            <label for="wemail" class="form-label">Email</label>
                            <input id="wemail" type="email" class="form-control" placeholder="Enter email address" required>
                        </div>
                        <div class="mb-3">
                            <label for="wpass" class="form-label">Password</label>
                            <input id="wpass" type="password" class="form-control" placeholder="Enter password" required>
                        </div>
                        <div class="mb-3">
                            <label for="wardenId" class="form-label">Warden ID</label>
                            <input id="wardenId" class="form-control" placeholder="Enter warden ID" required>
                        </div>
                        <div class="mb-3">
                            <label for="whostel" class="form-label">Assign Hostel</label>
                            <select id="whostel" class="form-control">
                                <option value="">Select Hostel</option>
                            </select>
                        </div>
                        <button onclick="createWarden()" class="btn btn-success w-100">
                            <i class="bi bi-person-check me-2"></i>Create Warden
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon">
                            <i class="bi bi-eye"></i>
                        </div>
                        <h5 class="card-title">View Hostels</h5>
                        <p class="card-text">Manage and view all hostels in the system</p>
                        <button onclick="loadHostels()" class="btn btn-info">
                            <i class="bi bi-list-ul me-2"></i>View Hostels
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="card-icon">
                            <i class="bi bi-people-fill"></i>
                        </div>
                        <h5 class="card-title">Manage Users</h5>
                        <p class="card-text">View and manage all system users</p>
                        <button onclick="loadUsers()" class="btn btn-success">
                            <i class="bi bi-person-lines-fill me-2"></i>Load Users
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Output Section -->
        <div id="output" class="mt-4"></div>
    `;
    // Load stats asynchronously after showing the UI
    setTimeout(() => {
        loadDashboardStats();
    }, 100);
}

function showHostels() {
    setActiveNav();
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Hostels Management</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="loadHostels()">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
            </div>
        </div>
        <div id="output"></div>
    `;
    loadHostels();
}

function showWardens() {
    setActiveNav();
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Wardens Management</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="loadWardens()">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
            </div>
        </div>
        <div id="output"></div>
    `;
    loadWardens();
}

function showUsers() {
    setActiveNav();
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Users Management</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="loadUsers()">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
            </div>
        </div>
        <div id="output"></div>
    `;
    loadUsers();
}

function showHostelRequests() {
    setActiveNav();
    document.querySelector('.main-content').innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2 text-white">Hostel Transfer Requests</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group me-2">
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="loadHostelRequests()">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
            </div>
        </div>
        <div id="output"></div>
    `;
    loadHostelRequests();
}

async function loadHostelRequests() {
    try {
        const res = await fetch(`${API}/api/auth/hostel-change-requests`);
        const requests = await res.json();

        let html = "<div class='card'><div class='card-header'><h5>Hostel Transfer Requests</h5></div><div class='card-body'><table class='table table-striped'>";
        html += "<thead><tr><th>Student</th><th>Current Hostel</th><th>Current Room</th><th>Requested Hostel</th><th>Requested Room</th><th>Warden</th><th>Status</th><th>Action</th></tr></thead><tbody>";

        requests.forEach(r => {
            html += `
            <tr>
                <td>${r.studentName || 'Unknown'}</td>
                <td>${r.currentHostel || '-'}</td>
                <td>${r.currentRoom || '-'}</td>
                <td>${r.requestedHostel || '-'}</td>
                <td>${r.requestedRoom || '-'}</td>
                <td>${r.wardenName || '-'}</td>
                <td>${r.status}</td>
                <td>
                    ${r.status === 'PENDING' ? `
                        <button onclick="approveRequest('${r._id}')" class="btn btn-success btn-sm me-1">Approve</button>
                        <button onclick="rejectRequest('${r._id}')" class="btn btn-danger btn-sm">Reject</button>
                    ` : `<span class="text-muted">No actions</span>`}
                </td>
            </tr>`;
        });

        html += "</tbody></table></div></div>";
        document.getElementById("output").innerHTML = html;
    } catch (error) {
        console.error("Error loading hostel requests:", error);
        document.getElementById("output").innerHTML = '<div class="alert alert-danger">Unable to load hostel transfer requests.</div>';
    }
}

async function approveRequest(id) {
    const comment = prompt("Optional admin comment for approval:", "Approved by admin.");
    const res = await fetch(`${API}/api/auth/hostel-change-requests/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminComment: comment })
    });

    if (!res.ok) {
        const text = await res.text();
        alert(text || "Unable to approve request.");
        return;
    }

    alert("Request approved.");
    loadHostelRequests();
}

async function rejectRequest(id) {
    const comment = prompt("Optional admin comment for rejection:", "Rejected by admin.");
    const res = await fetch(`${API}/api/auth/hostel-change-requests/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminComment: comment })
    });

    if (!res.ok) {
        const text = await res.text();
        alert(text || "Unable to reject request.");
        return;
    }

    alert("Request rejected.");
    loadHostelRequests();
}

// create hostel
async function createHostel(){
    const name = hostelName.value.trim();
    const roomsValue = rooms.value.trim();
    const bedsValue = beds.value.trim();

    if(!name || !roomsValue || !bedsValue){
        alert("Please fill in all required hostel fields.");
        return;
    }

    if(isNaN(roomsValue) || isNaN(bedsValue)){
        alert("Total rooms and beds per room must be numeric.");
        return;
    }

    try {
        const res = await fetch(`${API}/api/hostel/create`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                hostelName:name,
                totalRooms:Number(roomsValue),
                bedsPerRoom:Number(bedsValue)
            })
        });

        const data = await res.json();
        if(!res.ok){
            alert(data.message || "Unable to create hostel.");
            return;
        }

        alert("Hostel Created");
        loadDashboardStats();
        // Clear form
        hostelName.value = '';
        rooms.value = '';
        beds.value = '';
    } catch (error) {
        alert("Unable to create hostel right now. Please try again later.");
    }
}

// LOAD HOSTELS
async function loadHostels(){
    const res = await fetch(`${API}/api/hostel`);
    const data = await res.json();

    let html = "<div class='card'><div class='card-header'><h5>Hostel List</h5></div><div class='card-body'><table class='table table-striped'>";
    html += "<thead><tr><th>Hostel Name</th><th>Total Rooms</th><th>Beds Per Room</th></tr></thead><tbody>";

    data.forEach(h => {
        html += `<tr>
<td>${h.hostelName}</td>
<td>${h.totalRooms}</td>
<td>${h.bedsPerRoom}</td>
</tr>`;
    });

    html += "</tbody></table></div></div>";
    document.getElementById("output").innerHTML = html;
}

// create warden
async function createWarden(){
    const nameValue = wname.value.trim();
    const emailValue = wemail.value.trim();
    const passwordValue = wpass.value.trim();
    const wardenIdValue = wardenId.value.trim();
    const hostelValue = whostel.value;

    if(!nameValue || !emailValue || !passwordValue || !wardenIdValue || !hostelValue || hostelValue === "Select Hostel *"){
        alert("Please fill in all required warden details.");
        return;
    }

    try {
        const res = await fetch(`${API}/api/auth/create-warden`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name:nameValue,
                email:emailValue,
                password:passwordValue,
                wardenId:wardenIdValue,
                hostelName:hostelValue
            })
        });

        let data;
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        if(!res.ok){
            alert((data && data.message) ? data.message : (typeof data === 'string' ? data : "Unable to create warden."));
            return;
        }

        alert((data && data.message) ? data.message : "Warden Created");
        loadDashboardStats();
        // Clear form
        wname.value = '';
        wemail.value = '';
        wpass.value = '';
        wardenId.value = '';
        whostel.value = '';
    } catch (error) {
        alert("Unable to create warden right now. Please try again later.");
    }
}

async function reassignWarden(id){
    const select = document.getElementById(`reassign-${id}`);
    if(!select) return;

    const newHostel = select.value;
    if(!newHostel || newHostel === "Select Hostel"){
        alert("Please select a valid hostel.");
        return;
    }

    try {
        const res = await fetch(`${API}/api/auth/update-warden/${id}`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({ hostelName: newHostel })
        });

        const data = await res.text();
        if(!res.ok){
            alert(data || "Unable to update warden hostel.");
            return;
        }

        alert("Warden reassigned");

        // Reload appropriate data based on current view
        const activeNav = document.querySelector('.sidebar .nav-link.active');
        if (activeNav) {
            const navText = activeNav.textContent.trim();
            if (navText.includes('Wardens')) {
                loadWardens();
            } else if (navText.includes('Users')) {
                loadUsers();
            } else {
                loadDashboardStats();
            }
        }
    } catch (error) {
        alert("Unable to update warden right now. Please try again later.");
    }
}

// Load wardens (filtered users)
async function loadWardens(){
    const res = await fetch(`${API}/api/auth/all`);
    const data = await res.json();

    // Filter to show only wardens
    const wardens = data.filter(u => u.role === 'warden');

    let html = "<div class='card'><div class='card-header'><h5>Wardens Management</h5></div><div class='card-body'><table class='table table-striped'>";
    html += "<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Hostel</th><th>Actions</th></tr></thead><tbody>";

    wardens.forEach(u=>{
        let actionHtml = `<button onclick="del('${u._id}')" class="btn btn-danger btn-sm">Delete</button>`;
        if(u.role === "warden"){
            const options = knownHostels.map(h => `
                <option value="${h}"${h === u.hostelName ? ' selected' : ''}>${h}</option>
            `).join("");

            actionHtml = `
                <div class="d-flex align-items-center gap-2">
                    <select id="reassign-${u._id}" class="form-select form-select-sm" style="width: auto;">
                        <option>Select Hostel</option>
                        ${options}
                    </select>
                    <button onclick="reassignWarden('${u._id}')" class="btn btn-secondary btn-sm">Save</button>
                    <button onclick="del('${u._id}')" class="btn btn-danger btn-sm">Delete</button>
                </div>
            `;
        }

        html += `
        <tr>
        <td>${u.name}</td>
        <td>${u.email || '-'}</td>
        <td><span class="badge bg-success">${u.role}</span></td>
        <td>${u.hostelName || '-'}</td>
        <td>${actionHtml}</td>
        </tr>`;
    });

    html += "</tbody></table></div></div>";
    document.getElementById("output").innerHTML = html;
}

// Load all users (for Users management page)
async function loadUsers(){
    const res = await fetch(`${API}/api/auth/all`);
    const data = await res.json();

    let html = "<div class='card'><div class='card-header'><h5>All Users Management</h5></div><div class='card-body'><table class='table table-striped'>";
    html += "<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Hostel</th><th>Actions</th></tr></thead><tbody>";

    data.forEach(u=>{
        let actionHtml = `<button onclick="del('${u._id}')" class="btn btn-danger btn-sm">Delete</button>`;
        if(u.role === "warden"){
            const options = knownHostels.map(h => `
                <option value="${h}"${h === u.hostelName ? ' selected' : ''}>${h}</option>
            `).join("");

            actionHtml = `
                <div class="d-flex align-items-center gap-2">
                    <select id="reassign-${u._id}" class="form-select form-select-sm" style="width: auto;">
                        <option>Select Hostel</option>
                        ${options}
                    </select>
                    <button onclick="reassignWarden('${u._id}')" class="btn btn-secondary btn-sm">Save</button>
                    <button onclick="del('${u._id}')" class="btn btn-danger btn-sm">Delete</button>
                </div>
            `;
        }

        html += `
        <tr>
        <td>${u.name}</td>
        <td>${u.email || '-'}</td>
        <td><span class="badge bg-${u.role === 'admin' ? 'primary' : u.role === 'warden' ? 'success' : 'info'}">${u.role}</span></td>
        <td>${u.hostelName || '-'}</td>
        <td>${actionHtml}</td>
        </tr>`;
    });

    html += "</tbody></table></div></div>";
    document.getElementById("output").innerHTML = html;
}

// Delete user
async function del(id){
    await fetch(`${API}/api/auth/delete/${id}`,{
        method:"DELETE"
    });

    alert("Deleted");

    // Reload appropriate data based on current view
    const activeNav = document.querySelector('.sidebar .nav-link.active');
    if (activeNav) {
        const navText = activeNav.textContent.trim();
        if (navText.includes('Dashboard')) {
            loadDashboardStats();
        } else if (navText.includes('Wardens')) {
            loadWardens();
        } else if (navText.includes('Users')) {
            loadUsers();
        }
    }
}

// Initialize dashboard on page load
try {
    showDashboard();
} catch (error) {
    console.error('Error initializing dashboard:', error);
}
