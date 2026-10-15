function checkAlerts() {
    const ph = parseFloat(document.getElementById("phValue").value);
    const turbidity = parseFloat(document.getElementById("turbidityValue").value);
    const pressure = parseFloat(document.getElementById("pressureValue").value);
    const temperature = parseFloat(document.getElementById("temperatureValue").value);

    let alerts = [];
    let warnings = 0;
    let critical = 0;

    if (ph < 6.5 || ph > 8.5) {
        alerts.push("🚨 Critical: pH level is outside the safe range.");
        critical++;
    }

    if (turbidity > 4) {
        alerts.push("⚠️ Warning: High turbidity detected.");
        warnings++;
    }

    if (pressure > 4) {
        alerts.push("⚠️ Warning: High pressure detected.");
        warnings++;
    }

    if (temperature > 35) {
        alerts.push("⚠️ Warning: High temperature detected.");
        warnings++;
    }

    document.getElementById("activeAlertCount").textContent = alerts.length;
    document.getElementById("warningCount").textContent = warnings;
    document.getElementById("criticalCount").textContent = critical;

    const result = document.getElementById("alertResult");

    if (alerts.length === 0) {
        result.innerHTML = `
            <div class="alert-item success">
                <div class="alert-icon">✓</div>
                <div>
                    <strong>System Normal</strong>
                    <small>All parameters are within safe limits.</small>
                </div>
            </div>
        `;
    } else {
        result.innerHTML = alerts.map(alert => `
            <div class="alert-item warning">
                <div class="alert-icon">⚠️</div>
                <div>
                    <strong>${alert}</strong>
                    <small>Immediate monitoring recommended.</small>
                </div>
            </div>
        `).join("");
    }
}