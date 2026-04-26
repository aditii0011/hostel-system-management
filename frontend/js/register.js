function toggleForm(){
    const role = document.getElementById("role").value;

    document.getElementById("studentFields").style.display =
        role === "student" ? "block" : "none";
    document.getElementById("parentFields").style.display =
        role === "parent" ? "block" : "none";
}

async function loadHostels(){
    const res = await fetch("http://localhost:5000/api/hostel");
    const data = await res.json();

    let options = "<option>Select Hostel *</option>";
    data.forEach(h => {
        options += `<option value="${h.hostelName}">${h.hostelName}</option>`;
    });

    document.getElementById("hostelName").innerHTML = options;
}

loadHostels();

async function register(){
    const role = document.getElementById("role").value;
    const nameInput = document.getElementById("name").value.trim();
    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    if(!role){
        alert("Please select a role before registering.");
        return;
    }

    if(!nameInput || !emailInput || !passwordInput){
        alert("Please fill in all required account fields.");
        return;
    }

    const body = {
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        role
    };

    if(role === "student"){
        const studentId = document.getElementById("studentId").value.trim();
        const studentPhone = document.getElementById("studentPhone").value.trim();
        const room = document.getElementById("room").value.trim();
        const hostelName = document.getElementById("hostelName").value;
        const parentName = document.getElementById("parentName").value.trim();
        const parentPhone = document.getElementById("parentPhone").value.trim();

        if(!studentId || !studentPhone || !room || !hostelName || hostelName === "Select Hostel *" || !parentName || !parentPhone){
            alert("Please fill in all required student details.");
            return;
        }

        body.studentId = studentId;
        body.studentPhone = studentPhone;
        body.room = room;
        body.hostelName = hostelName;
        body.parentName = parentName;
        body.parentPhone = parentPhone;
    }

    if(role === "parent"){
        const phone = document.getElementById("phone").value.trim();
        const wardId = document.getElementById("wardId").value.trim();
        const wardName = document.getElementById("wardName").value.trim();

        if(!phone || !wardId || !wardName){
            alert("Please fill in all required parent details.");
            return;
        }

        body.phone = phone;
        body.wardId = wardId;
        body.wardName = wardName;
    }

    try {
        const res = await fetch("http://192.168.0.109:5000/api/auth/register",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
        });

        const data = await res.json();

        if(!res.ok){
            alert(data.message || "Unable to create account. Please check your information.");
            return;
        }

        alert("Account Created");
        window.location = "index.html";
    } catch (error) {
        alert("Unable to create account right now. Please try again later.");
    }
}
