async function loadHistory() {
    try {
        const response = await fetch("http://localhost:5000/api/history");

        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        const data = result.data;

        const tableBody = document.querySelector("tbody");
        const recordCount = document.querySelector(".record-count");

        if (!tableBody) return;

        tableBody.innerHTML = "";

        data.forEach(row => {

            const date = new Date(row.recorded_at);

            const formattedDate = date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

            let status = "Normal";

            if (
                row.ph < 6.5 ||
                row.ph > 8.5 ||
                row.turbidity > 4 ||
                row.pressure > 4 ||
                row.temperature > 35
            ) {
                status = "Warning";
            }

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${formattedDate}</td>

                <td>
                    <strong>${Number(row.ph).toFixed(2)}</strong>
                </td>

                <td>
                    ${Number(row.turbidity).toFixed(2)} NTU
                </td>

                <td>
                    ${Number(row.flow_rate).toFixed(0)} L/min
                </td>

                <td>
                    ${Number(row.pressure).toFixed(2)} bar
                </td>

                <td>
                    ${Number(row.temperature).toFixed(1)} °C
                </td>

                <td>
                    <span class="status ${status === "Normal" ? "normal" : "warning"}">
                        ● ${status}
                    </span>
                </td>
            `;

            tableBody.appendChild(tr);
        });

        if (recordCount) {
            recordCount.textContent = `${data.length} Records`;
        }

        calculateAverages(data);

    } catch (error) {
        console.error("History loading error:", error);
    }
}




function calculateAverages(data) {

    if (data.length === 0) return;

    let totalPh = 0;
    let totalTurbidity = 0;
    let totalFlow = 0;
    let totalPressure = 0;

    data.forEach(row => {

        totalPh += Number(row.ph);
        totalTurbidity += Number(row.turbidity);
        totalFlow += Number(row.flow_rate);
        totalPressure += Number(row.pressure);

    });

    const avgPh = totalPh / data.length;
    const avgTurbidity = totalTurbidity / data.length;
    const avgFlow = totalFlow / data.length;
    const avgPressure = totalPressure / data.length;

    const summaryValues =
        document.querySelectorAll(".summary-card strong");

    if (summaryValues.length >= 4) {

        summaryValues[0].textContent =
            avgPh.toFixed(2);

        summaryValues[1].textContent =
            avgTurbidity.toFixed(2);

        summaryValues[2].textContent =
            `${avgFlow.toFixed(0)} L/min`;

        summaryValues[3].textContent =
            `${avgPressure.toFixed(2)} bar`;
    }
}




function applyFilter() {

    const period =
        document.getElementById("periodFilter").value;

    const parameter =
        document.getElementById("parameterFilter").value;

    console.log("Period:", period);
    console.log("Parameter:", parameter);

    loadHistory();
}




const storedName =
    sessionStorage.getItem("userName");

if (storedName) {

    const userName =
        document.getElementById("userName");

    const userAvatar =
        document.getElementById("userAvatar");

    if (userName) {
        userName.textContent = storedName;
    }

    if (userAvatar) {
        userAvatar.textContent =
            storedName.charAt(0).toUpperCase();
    }
}




async function logout() {

    const activityId =
        sessionStorage.getItem("activityId");

    if (activityId) {

        try {

            await fetch(
                "http://localhost:5000/api/logout",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        activityId: activityId
                    })
                }
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );
        }
    }

    sessionStorage.clear();

    window.location.href =
        "index.html";
}




function toggleNotifications(event) {

    event.stopPropagation();

    const dropdown =
        document.getElementById("notificationDropdown");

    if (dropdown) {
        dropdown.classList.toggle("open");
    }
}


document.addEventListener("click", function(event) {

    const dropdown =
        document.getElementById("notificationDropdown");

    const wrapper =
        document.querySelector(".notification-wrapper");

    if (
        dropdown &&
        wrapper &&
        !wrapper.contains(event.target)
    ) {
        dropdown.classList.remove("open");
    }
});


document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        const dropdown =
            document.getElementById("notificationDropdown");

        if (dropdown) {
            dropdown.classList.remove("open");
        }
    }
});



loadHistory();