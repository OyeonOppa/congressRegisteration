// --- script.js ---

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const responseMessage = document.getElementById("responseMessage");
  const qrArea = document.getElementById("qrArea");
  const statusText = document.getElementById("statusText");
  const uidText = document.getElementById("uidText");
  const emailText = document.getElementById("emailText");
  const phoneText = document.getElementById("phoneText");

  const prefix = document.getElementById("prefix");
  const customPrefixBox = document.getElementById("customPrefixBox");
  const customPrefix = document.getElementById("customPrefix");

  const bringCar = document.getElementById("bringCar");
  const carPlateBox = document.getElementById("carPlateBox");

  const orgRadios = document.querySelectorAll("input[name='orgType']");
  const internationalSection = document.getElementById("internationalSection");

  const attendEvening = document.getElementById("attendEvening");
  const eveningDetails = document.getElementById("eveningDetails");

  const withSpouse = document.getElementById("withSpouse");
  const spouseFields = document.getElementById("spouseFields");

  // Toggle custom prefix
  if (prefix) {
    prefix.addEventListener("change", () => {
      if (prefix.value === "Other") {
        customPrefixBox.classList.remove("d-none");
        customPrefix.setAttribute("required", "required");
      } else {
        customPrefixBox.classList.add("d-none");
        customPrefix.removeAttribute("required");
      }
    });
  }

  // Toggle car plate
  if (bringCar) {
    bringCar.addEventListener("change", () => {
      carPlateBox.classList.toggle("d-none", bringCar.value !== "Yes");
    });
  }

  // Toggle international section
  if (orgRadios.length && internationalSection) {
    orgRadios.forEach(el =>
      el.addEventListener("change", () => {
        internationalSection.classList.toggle("d-none", el.value !== "International");
      })
    );
  }

  // Evening details
  if (attendEvening && eveningDetails) {
    attendEvening.addEventListener("change", () => {
      eveningDetails.classList.toggle("d-none", attendEvening.value !== "Yes");
    });
  }

  // Spouse fields
  if (withSpouse && spouseFields) {
    withSpouse.addEventListener("change", () => {
      spouseFields.classList.toggle("d-none", withSpouse.value !== "Yes");
    });
  }

  // --- Validation Helper ---
  function validateForm() {
    const phone = form.phone.value.trim();

    if (!/^[0-9]{9,10}$/.test(phone)) {
      responseMessage.innerHTML = `<div class="alert alert-warning p-2">⚠️ กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9–10 หลัก)</div>`;
      return false;
    }

    return true;
  }

  // --- Submit Form ---
  const scriptURL = "https://script.google.com/macros/s/AKfycbxTb5Qiba2-9zERJ58yug1w64bwk8fj2EFaXq0m9r-v-nPrxCnLVbuwFWS2jzT4BUvsnQ/exec";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    responseMessage.innerHTML = `<div class="alert alert-info p-2"><div class="spinner-border spinner-border-sm me-2"></div>Registering... Please wait.</div>`;
    qrArea.innerHTML = `<div class="muted-small">Generating QR Code…</div>`;
    statusText.textContent = "Processing...";
    uidText.textContent = "-";

    const fd = new FormData(form);

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

      console.log("Response:", data);

      if (data.success) {
        responseMessage.innerHTML = `<div class="alert alert-success p-2">✅ ลงทะเบียนเรียบร้อย ขอบคุณที่เข้าร่วมงาน</div>`;
        statusText.textContent = "Registered";
        uidText.textContent = data.uid || "-";
        emailText.textContent = form.email.value || "-";
        phoneText.textContent = form.phone.value || "-";

        const qrUrl = data.qrUrl || (data.qr ? "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=" + encodeURIComponent(data.qr) : null);
        if (qrUrl) {
          qrArea.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:8px;">`;
        } else {
          qrArea.innerHTML = `<div class="muted-small">ไม่พบ QR</div>`;
        }

        form.reset();
        carPlateBox.classList.add("d-none");
        customPrefixBox.classList.add("d-none");
        if (eveningDetails) eveningDetails.classList.add("d-none");
        if (spouseFields) spouseFields.classList.add("d-none");
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
});
