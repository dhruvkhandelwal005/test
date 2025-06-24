async function handleAuth() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const userRef = db.collection("users");
  const match = await userRef
    .where("username", "==", username)
    .where("password", "==", password)
    .where("role", "==", role)
    .get();

  if (!match.empty) {
    // Login success
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    redirectToDashboard(role);
  } else {
    // Try signup
    await userRef.add({ username, password, role });
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    redirectToDashboard(role);
  }
}

function redirectToDashboard(role) {
  if (role === "teacher") {
    window.location.href = "teacher.html";
  } else {
    window.location.href = "student.html";
  }
}
