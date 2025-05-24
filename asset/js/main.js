// Firebase config của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDHK--qqvAcbVLK6Y1l21jPMKiQVeDOVI8",
  authDomain: "esp32updatetkb.firebaseapp.com",
  databaseURL: "https://esp32updatetkb-default-rtdb.firebaseio.com",
  projectId: "esp32updatetkb",
  storageBucket: "esp32updatetkb.firebasestorage.app",
  messagingSenderId: "755269575664",
  appId: "1:755269575664:web:79e2cc4baea31a4659b335"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Load dữ liệu khi chọn khối lớp
document.getElementById("gradeSelect").addEventListener("change", function () {
  const grade = this.value;
  loadSchedule(grade);
});

// Load thời khóa biểu từ Firebase
function loadSchedule(grade) {
  db.ref("Khoi_lop/" + grade).once("value").then(snapshot => {
    const data = snapshot.val();
    document.getElementById("t2").value = data?.Thu2?.join(", ") || "";
    document.getElementById("t3").value = data?.Thu3?.join(", ") || "";
    document.getElementById("t4").value = data?.Thu4?.join(", ") || "";
    document.getElementById("t5").value = data?.Thu5?.join(", ") || "";
    document.getElementById("t6").value = data?.Thu6?.join(", ") || "";
  });
}

// Lưu thời khóa biểu với xác nhận ghi đè
function updateSchedule() {
  const grade = document.getElementById("gradeSelect").value;

  const parseInput = (id) => {
    const value = document.getElementById(id).value;
    return value.split(",").map(s => s.trim()).filter(s => s.length > 0);
  };

  const data = {
    Thu2: parseInput("t2"),
    Thu3: parseInput("t3"),
    Thu4: parseInput("t4"),
    Thu5: parseInput("t5"),
    Thu6: parseInput("t6"),
  };

  db.ref("Khoi_lop/" + grade).once("value").then(snapshot => {
    if (snapshot.exists()) {
      if (confirm("Dữ liệu đã tồn tại cho " + grade + ". Bạn có muốn ghi đè không?")) {
        saveSchedule(grade, data);
      }
    } else {
      saveSchedule(grade, data);
    }
  });
}

// Ghi dữ liệu vào Firebase
function saveSchedule(grade, data) {
  db.ref("Khoi_lop/" + grade).set(data)
    .then(() => {
      showToast("✅ Đã lưu thời khóa biểu cho " + grade);
      loadSchedule(grade);
    })
    .catch(error => {
      console.error("Lỗi khi lưu:", error);
      showToast("❌ Lỗi khi lưu thời khóa biểu", true);
    });
}

// Xuất thời khóa biểu ra PDF
function exportPDF() {
  const grade = document.getElementById("gradeSelect").value;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const headers = [["Thứ", "Môn học"]];
  const data = [
    ["Thứ 2", document.getElementById("t2").value],
    ["Thứ 3", document.getElementById("t3").value],
    ["Thứ 4", document.getElementById("t4").value],
    ["Thứ 5", document.getElementById("t5").value],
    ["Thứ 6", document.getElementById("t6").value],
  ];

  doc.setFontSize(14);
  doc.text("Thời Khóa Biểu - " + grade, 14, 15);
  doc.autoTable({
    head: headers,
    body: data,
    startY: 20,
  });
  doc.save("Thoi_Khoa_Bieu_" + grade + ".pdf");
}

// Hiển thị thông báo toast
function showToast(message, isError = false) {
  const toastBody = document.getElementById("toastBody");
  toastBody.textContent = message;
  toastBody.className = "toast-body";
  if (isError) {
    toastBody.classList.add("text-danger");
  }
  const toast = new bootstrap.Toast(document.getElementById("liveToast"));
  toast.show();
}
