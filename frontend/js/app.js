async function login(){
    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    if(!emailInput || !passwordInput){
        alert("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/auth/login",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                email: emailInput,
                password: passwordInput
            })
        });

        const data = await res.json();

        if(!res.ok || !data.user){
            alert("Invalid login credentials");
            return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));

        if(data.user.role === "warden"){
            window.location = "warden.html";
        }
        else if(data.user.role === "admin"){
            window.location = "admin.html";
        }
        else if(data.user.role === "parent"){
            window.location = "parent.html";
        }
        else{
            window.location = "dashboard.html";
        }
    } catch (error) {
        alert("Invalid login credentials. Please try again.");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (emailInput && passwordInput) {
        const submitOnEnter = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                login();
            }
        };

        emailInput.addEventListener("keydown", submitOnEnter);
        passwordInput.addEventListener("keydown", submitOnEnter);
    }
});
