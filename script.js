// --- URL Google Apps Script ของคุณ ---
const scriptURL =
  "https://script.google.com/macros/s/AKfycbx9CkM4mstI5yljtkulZQDtSBfE_fP23RTvWwNW0JgiYkzGVQdlOGwS5mPFbUf7pxpo/exec";

const form = document.getElementById("registerForm");
const responseMessage = document.getElementById("responseMessage");
const qrArea = document.getElementById("qrArea");
const statusText = document.getElementById("statusText");
const uidText = document.getElementById("uidText");
const emailText = document.getElementById("emailText");
const phoneText = document.getElementById("phoneText");

document.addEventListener("DOMContentLoaded", () => {
  const bringCar = document.getElementById("bringCar");
  const carPlateBox = document.getElementById("carPlateBox");
  const prefix = document.getElementById("prefix");
  const customPrefixBox = document.getElementById("customPrefixBox");
  const customPrefix = document.getElementById("customPrefix");

  // รถ
  bringCar.addEventListener("change", () => {
    carPlateBox.classList.toggle("d-none", bringCar.value !== "Yes");
  });

  // Prefix อื่น ๆ
  prefix.addEventListener("change", () => {
    if (prefix.value === "Other") {
      customPrefixBox.classList.remove("d-none");
      customPrefix.setAttribute("required", "required");
    } else {
      customPrefixBox.classList.add("d-none");
      customPrefix.removeAttribute("required");
    }
  });
});

// --- Validation Helper ---
function validateForm() {
  const phone = form.phone.value.trim();

  // เบอร์โทร 9–10 หลัก
  if (!/^[0-9]{9,10}$/.test(phone)) {
    responseMessage.innerHTML = `<div class="alert alert-warning p-2">⚠️ กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9–10 หลัก)</div>`;
    return false;
  }

  return true;
}

// Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  responseMessage.innerHTML = `<div class="alert alert-info p-2"><div class="spinner-border spinner-border-sm me-2"></div>กำลังลงทะเบียน... กรุณารอสักครู่</div>`;
  qrArea.innerHTML = `<div class="muted-small">กำลังสร้าง QR Code…</div>`;
  statusText.textContent = "Processing...";
  uidText.textContent = "-";

  const fd = new FormData(form);

  // เพิ่ม hidden field สำหรับเลือก sheet
  fd.append("sheetName", "Register2");

  try {
    const res = await fetch(scriptURL, { method: "POST", body: fd });
    let data;
    const ct = res.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: text.toLowerCase().includes("success"), raw: text };
      }
    }

    if (data.success) {
      responseMessage.innerHTML = `<div class="alert alert-success p-2">✅ ลงทะเบียนเรียบร้อย ขอบคุณที่เข้าร่วมงาน</div>`;
      statusText.textContent = "Registered";
      uidText.textContent = data.uid || "-";
      emailText.textContent = form.email.value || "-";
      phoneText.textContent = form.phone.value || "-";

      const qrUrl =
        data.qrUrl ||
        (data.qr &&
          (data.qr.startsWith("http")
            ? data.qr
            : "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=" +
              encodeURIComponent(data.qr)));
      qrArea.innerHTML = qrUrl
        ? `<img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:8px;">`
        : `<div class="muted-small">ไม่พบ QR</div>`;

      form.reset();
      document.getElementById("carPlateBox").classList.add("d-none");
      document.getElementById("customPrefixBox").classList.add("d-none");
    } else {
      responseMessage.innerHTML = `<div class="alert alert-danger p-2">❌ ระบบไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้จัดงาน</div>`;
      statusText.textContent = "เกิดข้อผิดพลาด";
      qrArea.innerHTML = `<div class="muted-small">ไม่สามารถสร้าง QR</div>`;
    }
  } catch (err) {
    console.error(err);
    responseMessage.innerHTML = `<div class="alert alert-danger p-2">❌ ข้อผิดพลาดเครือข่าย: ${err.message}</div>`;
    statusText.textContent = "ข้อผิดพลาดเครือข่าย";
    qrArea.innerHTML = `<div class="muted-small">ไม่สามารถเชื่อมต่อ</div>`;
  } finally {
    submitBtn.disabled = false;
  }
});
