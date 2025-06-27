if (!localStorage.getItem("username") || !localStorage.getItem("role")) {
  alert("Session expired. Please log in again.");
  window.location.href = "index.html";
}

const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (!username || role !== "teacher") {
  window.location.href = "index.html";
}

document.getElementById("teacherName").innerText = username;

const classKey = `class_${username}`;
let currentSessionId = null;
let activeSession = null;

const savedClass = localStorage.getItem(classKey);
if (savedClass) {
  document.getElementById("savedClassName").innerText = savedClass;
  document.getElementById("className").style.display = "none";
}

function saveClass() {
  const className = document.getElementById("className").value.trim();
  if (className) {
    localStorage.setItem(classKey, className);
    location.reload();
  }
}

async function toggleAttendance() {
  const className = localStorage.getItem(classKey);
  if (!className) return alert("Please save class name first.");

  if (!activeSession) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const doc = await db.collection("attendanceSessions").add({
        teacher: username,
        className,
        isActive: true,
        lat,
        lng,
        radius: 100,
        startTime: new Date()
      });

      currentSessionId = doc.id;
      activeSession = true;
      document.getElementById("toggleBtn").innerText = "Stop Attendance";
      alert("Attendance session started.");
    });
  } else {
    await db.collection("attendanceSessions").doc(currentSessionId).update({
      isActive: false,
      endTime: new Date()
    });
    activeSession = false;
    document.getElementById("toggleBtn").innerText = "Start Attendance";
    alert("Attendance session ended.");
    loadAttendanceRecords();
  }
}

async function loadAttendanceRecords() {
  const container = document.getElementById("records");
  container.innerHTML = "";

  const sessions = await db.collection("attendanceSessions")
    .where("teacher", "==", username)
    .orderBy("startTime", "desc")
    .get();

  for (const doc of sessions.docs) {
    const data = doc.data();
    const logSnapshot = await db.collection("attendanceLogs")
      .where("sessionId", "==", doc.id)
      .get();

    const listItems = logSnapshot.docs.map(log =>
      `<li>${log.data().username} at ${new Date(log.data().time.toDate()).toLocaleString()}</li>`
    ).join("");

    container.innerHTML += `
      <div style="margin:10px 0; border:1px solid #ccc; padding:10px;">
        <strong>${data.className}</strong> — ${new Date(data.startTime.toDate()).toLocaleString()}<br>
        <ul>${listItems || "<li>No students marked present</li>"}</ul>
      </div>
    `;
  }
}
function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}


loadAttendanceRecords();