let qualityChart;

async function loadAnalytics() {
    try {
        const response = await fetch("http://localhost:5000/api/history");

        if (!response.ok) {
            throw new Error("Failed to fetch history data");
        }

        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            console.log("No history data available");
            return;
        }

        let data = [...result.data];

        
        data = data.slice(0, 30).reverse();

        const labels = data.map(item => {
            const date = new Date(item.recorded_at);

            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
        });

        const phData = data.map(item => Number(item.ph));
        const turbidityData = data.map(item => Number(item.turbidity));

        createChart(labels, phData, turbidityData);
        updateSummary(data);

    } catch (error) {
        console.error("Analytics error:", error);
    }
}




function createChart(labels, phData, turbidityData) {

    const canvas = document.getElementById("qualityChart");

    if (!canvas) {
        console.error("Chart canvas not found");
        return;
    }

    if (qualityChart) {
        qualityChart.destroy();
    }

    qualityChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: labels,

            datasets: [
                {
                    label: "pH",
                    data: phData,
                    borderWidth: 3,
                    pointRadius: 5,
                    tension: 0.4,
                    yAxisID: "y"
                },
                {
                    label: "Turbidity (NTU)",
                    data: turbidityData,
                    borderWidth: 3,
                    pointRadius: 5,
                    tension: 0.4,
                    yAxisID: "y1"
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "top"
                }
            },

            scales: {
                y: {
                    type: "linear",
                    position: "left",
                    title: {
                        display: true,
                        text: "pH"
                    },
                    min: 6,
                    max: 9
                },

                y1: {
                    type: "linear",
                    position: "right",
                    title: {
                        display: true,
                        text: "Turbidity (NTU)"
                    },
                    min: 0,
                    max: 5,

                    grid: {
                        drawOnChartArea: false
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Recorded Time"
                    }
                }
            }
        }
    });
}




function updateSummary(data) {

    if (data.length === 0) return;

    let totalPH = 0;
    let totalTurbidity = 0;
    let totalFlow = 0;
    let totalPressure = 0;

    data.forEach(item => {
        totalPH += Number(item.ph);
        totalTurbidity += Number(item.turbidity);
        totalFlow += Number(item.flow_rate);
        totalPressure += Number(item.pressure);
    });

    const avgPH = totalPH / data.length;
    const avgTurbidity = totalTurbidity / data.length;
    const avgFlow = totalFlow / data.length;
    const avgPressure = totalPressure / data.length;

    const cards = document.querySelectorAll(".metric-card");

    if (cards.length >= 4) {

        cards[0].querySelector("h2").textContent =
            avgPH.toFixed(2);

        cards[1].querySelector("h2").innerHTML =
            `${avgTurbidity.toFixed(2)} <small>NTU</small>`;

        cards[2].querySelector("h2").innerHTML =
            `${avgFlow.toFixed(0)} <small>L/min</small>`;

        cards[3].querySelector("h2").innerHTML =
            `${avgPressure.toFixed(2)} <small>bar</small>`;
    }
}




async function updateChart() {

    const periodSelect = document.getElementById("periodSelect");

    if (!periodSelect) {
        console.error("Period select not found");
        return;
    }

    const period = periodSelect.value;

    try {

        const response =
            await fetch("http://localhost:5000/api/history");

        if (!response.ok) {
            throw new Error("Failed to fetch history data");
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            return;
        }

        let data = [...result.data];

        if (period === "24") {
            data = data.slice(0, 24);

        } else if (period === "7") {
            data = data.slice(0, 7);

        } else if (period === "30") {
            data = data.slice(0, 30);
        }

        data = data.reverse();

        const labels = data.map(item => {

            const date = new Date(item.recorded_at);

            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
        });

        const phData =
            data.map(item => Number(item.ph));

        const turbidityData =
            data.map(item => Number(item.turbidity));

        createChart(
            labels,
            phData,
            turbidityData
        );

    } catch (error) {

        console.error(
            "Chart update error:",
            error
        );
    }
}




function logout() {

    const activityId =
        sessionStorage.getItem("activityId");

    if (activityId) {

        fetch("http://localhost:5000/api/logout", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                activityId: activityId
            })
        }).finally(() => {

            sessionStorage.clear();

            window.location.href = "index.html";
        });

    } else {

        sessionStorage.clear();

        window.location.href = "index.html";
    }
}




loadAnalytics();