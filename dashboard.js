

function loadUserDetails() {

    const userName = sessionStorage.getItem("userName");

    const userAvatar = document.getElementById("userAvatar");
    const userNameElement = document.getElementById("userName");

    if (userName && userAvatar && userNameElement) {

        userNameElement.textContent = userName;

        userAvatar.textContent = userName.charAt(0).toUpperCase();

    }

}




async function loadWaterQuality() {

    let latest = null;

    try {

        const response = await fetch(
            "http://localhost:5000/api/water-quality"
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (data && data.length > 0) {
            latest = data[data.length - 1];
        }

    }

    catch (error) {

        console.warn("Backend unavailable. Using demo data.");

    }


    

    if (!latest) {

        latest = {
            ph: 7.2,
            turbidity: 2.1,
            flow_rate: 82,
            pressure: 3.4,
            temperature: 26.5
        };

    }


    

    document.getElementById("phValue").textContent =
        latest.ph;

    document.getElementById("turbidityValue").textContent =
        latest.turbidity;

    document.getElementById("flowValue").textContent =
        latest.flow_rate;

    document.getElementById("pressureValue").textContent =
        latest.pressure;


    

    const phStatus = document.getElementById("phStatus");

    if (latest.ph >= 6.5 && latest.ph <= 8.5) {

        phStatus.textContent = "● Normal";
        phStatus.style.color = "#079b64";

    } else {

        phStatus.textContent = "● Critical";
        phStatus.style.color = "#e45555";

    }


   

    const turbidityStatus =
        document.getElementById("turbidityStatus");

    if (latest.turbidity <= 4) {

        turbidityStatus.textContent = "● Normal";
        turbidityStatus.style.color = "#079b64";

    } else {

        turbidityStatus.textContent = "● High";
        turbidityStatus.style.color = "#e45555";

    }


    

    const pressureStatus =
        document.getElementById("pressureStatus");

    if (latest.pressure <= 4) {

        pressureStatus.textContent = "● Normal";
        pressureStatus.style.color = "#079b64";

    } else {

        pressureStatus.textContent = "● High";
        pressureStatus.style.color = "#e45555";

    }


   

    const scorePh = document.getElementById("scorePh");
    const scoreTurbidity = document.getElementById("scoreTurbidity");
    const scorePressure = document.getElementById("scorePressure");
    const scoreTemperature = document.getElementById("scoreTemperature");

    if (scorePh) scorePh.textContent = latest.ph;
    if (scoreTurbidity) scoreTurbidity.textContent = latest.turbidity + " NTU";
    if (scorePressure) scorePressure.textContent = latest.pressure + " bar";
    if (scoreTemperature) scoreTemperature.textContent =
        (latest.temperature || 26.5) + " °C";


    
    let score = 100;

    if (latest.ph < 6.5 || latest.ph > 8.5) {
        score -= 30;
    }

    if (latest.turbidity > 4) {
        score -= 25;
    }

    if (latest.pressure > 4) {
        score -= 20;
    }

    if (latest.temperature && latest.temperature > 35) {
        score -= 15;
    }


    

    const qualityScoreEl = document.getElementById("qualityScore");

    if (qualityScoreEl) {
        qualityScoreEl.textContent = score;
    }


    

    const scoreCircle = document.querySelector(".score-circle");

    if (scoreCircle) {

        const degrees = (score / 100) * 360;

        
        let ringColor = "#079b64";   

        if (score < 80) {
            ringColor = "#e69a23";   
        }

        if (score < 60) {
            ringColor = "#e45555";   
        }

        scoreCircle.style.background = `
            radial-gradient(circle, #ffffff 60%, transparent 61%),
            conic-gradient(
                ${ringColor} 0deg ${degrees}deg,
                #e5edf1 ${degrees}deg 360deg
            )
        `;

    }


    

    const qualityStatus = document.getElementById("qualityStatus");

    if (qualityStatus) {

        if (score >= 80) {

            qualityStatus.textContent = "● GOOD QUALITY";
            qualityStatus.style.color = "#079b64";

        }

        else if (score >= 60) {

            qualityStatus.textContent = "● ACCEPTABLE";
            qualityStatus.style.color = "#e69a23";

        }

        else {

            qualityStatus.textContent = "● ATTENTION REQUIRED";
            qualityStatus.style.color = "#e45555";

        }

    }

}




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

        }

        catch (error) {

            console.error("Logout error:", error);

        }

    }

    sessionStorage.clear();

    window.location.href = "index.html";

}




loadUserDetails();

loadWaterQuality();


setInterval(loadWaterQuality, 10000);