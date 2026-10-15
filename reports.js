

const storedName = sessionStorage.getItem("userName");

if (storedName) {

    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");

    if (userName) {
        userName.textContent = storedName;
    }

    if (userAvatar) {
        userAvatar.textContent =
            storedName.charAt(0).toUpperCase();
    }
}




function toggleNotifications(event) {

    event.stopPropagation();

    const dropdown =
        document.getElementById("notificationDropdown");

    if (dropdown) {
        dropdown.classList.toggle("open");
    }
}


document.addEventListener("click", function (event) {

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


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        const dropdown =
            document.getElementById("notificationDropdown");

        if (dropdown) {
            dropdown.classList.remove("open");
        }
    }
});




let reportData = [];

let filteredReportData = [];



async function loadReportSummary() {

    try {

        const response =
            await fetch("http://localhost:5000/api/history");

        if (!response.ok) {
            throw new Error("History API failed");
        }

        const result =
            await response.json();

        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {
            throw new Error("Invalid history data");
        }

        reportData = result.data;

        console.log("Report data from MySQL:", reportData);

        if (reportData.length === 0) {

            console.log("No history records found.");

            return;
        }

        applyReportFilter();

    } catch (error) {

        console.error(
            "Report loading error:",
            error
        );

    }
}




function applyReportFilter() {

    const periodElement =
        document.getElementById("reportPeriod");

    if (!periodElement) {
        filteredReportData = [...reportData];
        calculateReportSummary(filteredReportData);
        return;
    }

    const period =
        periodElement.value;

    const now = new Date();

    let startTime;

    if (period === "Last 24 Hours") {

        startTime =
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000
            );

    } else if (period === "Last 7 Days") {

        startTime =
            new Date(
                now.getTime() -
                7 * 24 * 60 * 60 * 1000
            );

    } else if (period === "Last 30 Days") {

        startTime =
            new Date(
                now.getTime() -
                30 * 24 * 60 * 60 * 1000
            );

    } else {

        startTime = null;
    }


    if (!startTime) {

        filteredReportData =
            [...reportData];

    } else {

        filteredReportData =
            reportData.filter(row => {

                const recordedTime =
                    new Date(row.recorded_at);

                return recordedTime >= startTime;
            });

    }


    

    if (filteredReportData.length === 0) {

        filteredReportData =
            [...reportData];

    }


    calculateReportSummary(
        filteredReportData
    );
}




function calculateReportSummary(data) {

    if (!data || data.length === 0) {
        return;
    }


    let totalPh = 0;
    let totalTurbidity = 0;
    let totalFlow = 0;
    let totalPressure = 0;
    let totalTemperature = 0;


    data.forEach(row => {

        totalPh +=
            Number(row.ph) || 0;

        totalTurbidity +=
            Number(row.turbidity) || 0;

        totalFlow +=
            Number(row.flow_rate) || 0;

        totalPressure +=
            Number(row.pressure) || 0;

        totalTemperature +=
            Number(row.temperature) || 0;

    });


    const count = data.length;


    const avgPh =
        totalPh / count;

    const avgTurbidity =
        totalTurbidity / count;

    const avgFlow =
        totalFlow / count;

    const avgPressure =
        totalPressure / count;

    const avgTemperature =
        totalTemperature / count;


    

    const avgPhElement =
        document.getElementById("avgPh");

    if (avgPhElement) {

        avgPhElement.textContent =
            avgPh.toFixed(2);
    }


    const avgTurbidityElement =
        document.getElementById("avgTurbidity");

    if (avgTurbidityElement) {

        avgTurbidityElement.innerHTML =
            `${avgTurbidity.toFixed(2)}
             <small>NTU</small>`;
    }


    const avgFlowElement =
        document.getElementById("avgFlow");

    if (avgFlowElement) {

        avgFlowElement.innerHTML =
            `${avgFlow.toFixed(0)}
             <small>L/min</small>`;
    }


    const avgPressureElement =
        document.getElementById("avgPressure");

    if (avgPressureElement) {

        avgPressureElement.innerHTML =
            `${avgPressure.toFixed(2)}
             <small>bar</small>`;
    }


    

    const reportPh =
        document.getElementById("reportPh");

    if (reportPh) {

        reportPh.textContent =
            avgPh.toFixed(2);
    }


    const reportTurbidity =
        document.getElementById("reportTurbidity");

    if (reportTurbidity) {

        reportTurbidity.textContent =
            avgTurbidity.toFixed(2);
    }


    const reportFlow =
        document.getElementById("reportFlow");

    if (reportFlow) {

        reportFlow.textContent =
            avgFlow.toFixed(0);
    }


    const reportPressure =
        document.getElementById("reportPressure");

    if (reportPressure) {

        reportPressure.textContent =
            avgPressure.toFixed(2);
    }


    const reportTemperature =
        document.getElementById("reportTemperature");

    if (reportTemperature) {

        reportTemperature.textContent =
            avgTemperature.toFixed(1);
    }


  

    let overallNormal = true;


    if (
        avgPh < 6.5 ||
        avgPh > 8.5
    ) {
        overallNormal = false;
    }


    if (avgTurbidity > 4) {
        overallNormal = false;
    }


    if (avgPressure > 4) {
        overallNormal = false;
    }


    if (avgTemperature > 35) {
        overallNormal = false;
    }


    const statusText =
        document.querySelector(
            ".report-footer span"
        );


    if (statusText) {

        if (overallNormal) {

            statusText.textContent =
                "● All monitored parameters are within normal range";

        } else {

            statusText.textContent =
                "● Attention required: one or more parameters are outside the normal range";
        }
    }


    console.log("Report Summary:", {

        records: data.length,

        averagePh:
            avgPh,

        averageTurbidity:
            avgTurbidity,

        averageFlow:
            avgFlow,

        averagePressure:
            avgPressure,

        averageTemperature:
            avgTemperature

    });
}




function generateReport() {

    const periodElement =
        document.getElementById("reportPeriod");

    const typeElement =
        document.getElementById("reportType");


    if (!periodElement || !typeElement) {
        return;
    }


    const period =
        periodElement.value;

    const reportType =
        typeElement.value;


    

    applyReportFilter();


    

    const periodText =
        document.getElementById("periodText");

    if (periodText) {

        periodText.textContent =
            period;
    }


    

    const reportStatus =
        document.querySelector(".report-status");

    if (reportStatus) {

        reportStatus.textContent =
            "● Report Ready";
    }


    alert(
        reportType +
        " generated successfully for " +
        period
    );
}




function downloadReport() {

    if (
        !filteredReportData ||
        filteredReportData.length === 0
    ) {

        alert(
            "No report data available."
        );

        return;
    }


    const periodElement =
        document.getElementById("reportPeriod");

    const typeElement =
        document.getElementById("reportType");


    const period =
        periodElement
            ? periodElement.value
            : "Selected Period";


    const reportType =
        typeElement
            ? typeElement.value
            : "Water Quality Report";


    

    const avgPh =
        calculateAverage(
            "ph",
            filteredReportData
        );


    const avgTurbidity =
        calculateAverage(
            "turbidity",
            filteredReportData
        );


    const avgFlow =
        calculateAverage(
            "flow_rate",
            filteredReportData
        );


    const avgPressure =
        calculateAverage(
            "pressure",
            filteredReportData
        );


    const avgTemperature =
        calculateAverage(
            "temperature",
            filteredReportData
        );


    

    let systemStatus =
        "All monitored parameters are within normal range.";


    if (
        avgPh < 6.5 ||
        avgPh > 8.5 ||
        avgTurbidity > 4 ||
        avgPressure > 4 ||
        avgTemperature > 35
    ) {

        systemStatus =
            "Attention required: one or more parameters are outside the normal range.";
    }


    

    const reportText = `

WATERGUARD
Water Treatment Monitoring Report
==========================================

Report Type:
${reportType}

Report Period:
${period}

Records Analyzed:
${filteredReportData.length}

------------------------------------------
PARAMETER SUMMARY
------------------------------------------

Average pH           : ${avgPh.toFixed(2)}
Average Turbidity    : ${avgTurbidity.toFixed(2)} NTU
Average Flow Rate    : ${avgFlow.toFixed(2)} L/min
Average Pressure     : ${avgPressure.toFixed(2)} bar
Average Temperature  : ${avgTemperature.toFixed(2)} °C

------------------------------------------

Overall System Status:
${systemStatus}

------------------------------------------

Generated by WaterGuard
Intelligent Water Monitoring System

Generated On:
${new Date().toLocaleString()}

`;


    

    const blob =
        new Blob(
            [reportText],
            {
                type: "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "WaterGuard_Report.txt";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    alert(
        "Report downloaded successfully."
    );
}




function calculateAverage(
    parameter,
    data = reportData
) {

    if (
        !data ||
        data.length === 0
    ) {
        return 0;
    }


    let total = 0;


    data.forEach(row => {

        total +=
            Number(row[parameter]) || 0;

    });


    return total / data.length;
}




function viewReport(reportName) {

    alert(
        reportName +
        " is available for review."
    );
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
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        activityId:
                            activityId
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




document.addEventListener(
    "DOMContentLoaded",
    function () {

        const periodSelect =
            document.getElementById(
                "reportPeriod"
            );


        if (periodSelect) {

            periodSelect.addEventListener(
                "change",
                function () {

                    applyReportFilter();

                    const periodText =
                        document.getElementById(
                            "periodText"
                        );

                    if (periodText) {

                        periodText.textContent =
                            periodSelect.value;
                    }

                }
            );
        }

    }
);



loadReportSummary();