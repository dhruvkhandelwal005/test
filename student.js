if (!localStorage.getItem("username") || !localStorage.getItem("role")) {
  alert("Session expired. Please log in again.");
  window.location.href = "index.html";
}

const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (!username || role !== "student") {
  window.location.href = "index.html";
}

document.getElementById("studentName").innerText = username;

let intervalId = null;
let isMarking = false;

function toggleMarking() {
  if (!isMarking) {
    intervalId = setInterval(checkAndMarkAttendance, 5000);
    document.getElementById("markBtn").innerText = "Stop";
    isMarking = true;
    alert("Started marking attendance.");
  } else {
    clearInterval(intervalId);
    document.getElementById("markBtn").innerText = "Mark Attendance";
    isMarking = false;
    loadMyAttendance();
    alert("Stopped marking.");
  }
}

async function checkAndMarkAttendance() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const activeSessions = await db.collection("attendanceSessions")
      .where("isActive", "==", true)
      .get();

    for (const doc of activeSessions.docs) {
      const data = doc.data();
      const distance = getDistance(lat, lng, data.lat, data.lng);

      console.log(`📍 Found active session: ${data.className}`);
      console.log(`Student location: ${lat}, ${lng}`);
      console.log(`Distance to teacher: ${distance} meters`);

      if (distance <= data.radius) {
        // ✅ Check if already marked for this session
        const alreadyMarked = await db.collection("attendanceLogs")
          .where("username", "==", username)
          .where("sessionId", "==", doc.id)
          .limit(1)
          .get();

        if (!alreadyMarked.empty) {
          console.log("🛑 Already marked. Skipping...");
          continue; // Skip marking again
        }

        // ✅ Mark attendance
        await db.collection("attendanceLogs").add({
          username,
          className: data.className,
          sessionId: doc.id,
          time: new Date()
        });

        console.log(`✅ Marked present for ${data.className}`);
      } else {
        console.log("❌ Too far. Not marking.");
      }
    }
  }, (err) => {
    console.error("Location access denied:", err.message);
  });
}


function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function loadMyAttendance() {
  const recordsDiv = document.getElementById("myRecords");
  recordsDiv.innerHTML = "";

  const logs = await db.collection("attendanceLogs")
    .where("username", "==", username)
    .orderBy("time", "desc")
    .get();

  logs.forEach(log => {
    const data = log.data();
    const time = new Date(data.time.toDate()).toLocaleString();
   recordsDiv.innerHTML += `
  <div style="border-bottom:1px solid #ccc; margin-bottom:8px;">
    ✅ <strong>${data.className}</strong><br>
    🕒 ${new Date(data.time.toDate()).toLocaleString()}
  </div>
`;

  });
}
function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}

loadMyAttendance();