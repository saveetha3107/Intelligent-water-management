document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {

            sessionStorage.setItem("activityId", data.activityId);
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("userName", data.name);
            sessionStorage.setItem("userRole", data.role);

            window.location.href = "dashboard.html";

        } else {
            message.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Server connection failed";
    }
});


async function logout() {

    const activityId = sessionStorage.getItem("activityId");

    if (activityId) {
        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    activityId: activityId
                })
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    sessionStorage.clear();

    window.location.href = "index.html";
}