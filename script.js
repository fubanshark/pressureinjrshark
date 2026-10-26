// ===== ตั้งค่าเบอร์โทรโรงพยาบาล (แก้ตรงนี้ที่เดียว) =====
const hospitalName = "";   // เช่น "โรงพยาบาลหนองคาย"
const hospitalTel = "";    // ตัวเลขล้วน ไม่มีขีด เช่น "0421234567" (เช็กจากเว็บทางการของโรงพยาบาล)

// ===== 1. เรียกหาองค์ประกอบในหน้าเว็บ =====
const viewForm = document.getElementById("viewForm");
const viewLoading = document.getElementById("viewLoading");
const viewResult = document.getElementById("viewResult");

const cameraInput = document.getElementById("cameraInput");
const imageInput = document.getElementById("imageInput");
const emptyState = document.getElementById("emptyState");
const preview = document.getElementById("preview");
const clearBtn = document.getElementById("clearBtn");
const toast = document.getElementById("toast");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusText = document.getElementById("status");

const resultThumb = document.getElementById("resultThumb");
const resultEmoji = document.getElementById("resultEmoji");
const resultName = document.getElementById("resultName");
const resultEn = document.getElementById("resultEn");
const resultMeta = document.getElementById("resultMeta");
const resultSummary = document.getElementById("resultSummary");
const lowConfNote = document.getElementById("lowConfNote");
const detailTitle = document.getElementById("detailTitle");
const resultDetail = document.getElementById("resultDetail");
const todoTitle = document.getElementById("todoTitle");
const resultTodo = document.getElementById("resultTodo");
const moreSection = document.getElementById("moreSection");
const scrollHint = document.getElementById("scrollHint");
const callHospital = document.getElementById("callHospital");
const callHospitalText = document.getElementById("callHospitalText");
const retryBtn = document.getElementById("retryBtn");

// ===== 2. ค่าตั้งต้น =====
const allowedTypes = ["image/jpeg", "image/png"];
const maxSizeMB = 10;
const lowConfidence = 0.6;     // ต่ำกว่า 60% ให้เตือนว่าไม่ค่อยมั่นใจ
const minLoadingMs = 1500;     // ให้หน้า "รอสักครู่" ค้างอย่างน้อยเท่านี้ (ไม่นับรวมในเวลาประมวลผลจริง)
let currentUrl = null;
let toastTimer = null;

// ===== 3. สลับมุมมอง =====
function showView(name) {
  viewForm.hidden = name !== "form";
  viewLoading.hidden = name !== "loading";
  viewResult.hidden = name !== "result";
  window.scrollTo(0, 0);
}

// ===== 4. เลือกรูป (ใช้ร่วมกันทั้งช่องถ่ายรูปและช่องอัปโหลด) =====
function handleFile(file) {
  if (!file) {
    return;
  }
  if (!allowedTypes.includes(file.type)) {
    resetPage("กรุณาเลือกไฟล์รูป .jpg หรือ .png เท่านั้น");
    return;
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    resetPage("ไฟล์ใหญ่เกินไป กรุณาเลือกรูปที่ไม่เกิน " + maxSizeMB + " MB");
    return;
  }

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
  }
  currentUrl = URL.createObjectURL(file);

  preview.src = currentUrl;
  preview.hidden = false;
  emptyState.hidden = true;
  clearBtn.hidden = false;
  statusText.textContent = "";

  analyzeBtn.disabled = false;
  analyzeBtn.classList.remove("ready");
  void analyzeBtn.offsetWidth;
  analyzeBtn.classList.add("ready");

  showToast();
}

imageInput.addEventListener("change", function () {
  handleFile(imageInput.files[0]);
});
cameraInput.addEventListener("change", function () {
  handleFile(cameraInput.files[0]);
});
clearBtn.addEventListener("click", function () {
  resetPage("");
});

// ===== 5. ป้ายเด้ง "เลือกรูปเรียบร้อยแล้ว" 3 วินาที =====
function showToast() {
  toast.hidden = false;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.hidden = true;
    toast.classList.remove("show");
  }, 3000);
}

// ===== 6. ล้างหน้า =====
function resetPage(message) {
  imageInput.value = "";
  cameraInput.value = "";
  preview.hidden = true;
  preview.removeAttribute("src");
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
  emptyState.hidden = false;
  clearBtn.hidden = true;
  analyzeBtn.disabled = true;
  analyzeBtn.classList.remove("ready");
  toast.hidden = true;
  toast.classList.remove("show");
  statusText.textContent = message;
}

// ===== 7. ข้อมูลของแต่ละคลาส (ชื่อคลาสต้องตรงกับ metadata.json เป๊ะ) =====
const stageInfo = {
  "stage1": {
    name: "แผลกดทับ ระยะที่ 1",
    en: "Non-blanchable Erythema",
    summary: "ผิวหนังยังไม่มีแผลเปิด พบรอยปื้นแดงที่กดแล้วไม่จางหาย",
    detail: "ผิวหนังชั้นนอกยังคงสมบูรณ์ ไม่มีการฉีกขาดหรือเกิดเป็นแผลเปิด แต่เริ่มมีรอยปื้นแดงขึ้นเฉพาะที่ โดยเฉพาะจุดที่มีปุ่มกระดูก เมื่อใช้นิ้วกดลงบนรอยแดง สีแดงนั้นจะไม่จางหายไป (Non-blanchable erythema) ในผู้ที่มีสีผิวเข้มอาจเห็นเป็นรอยสีคล้ำหรือสีที่แตกต่างจากผิวข้างเคียง บริเวณนั้นอาจปวด อุ่น หรือเย็นกว่าผิวรอบๆ อย่างเห็นได้ชัด",
    todo: [
      "พลิกตัวและเปลี่ยนท่านอนให้ผู้ป่วยทุก 2 ชั่วโมง เพื่อลดแรงกดทับ",
      "ใช้หมอนหรืออุปกรณ์รองรับหนุนบริเวณปุ่มกระดูก ไม่ให้สัมผัสพื้นผิวโดยตรง",
      "ดูแลผิวหนังให้สะอาดและแห้ง ไม่อับชื้น",
      "หลีกเลี่ยงการนวดหรือถูแรงๆ บริเวณรอยแดง",
      "ถ้ารอยแดงไม่ดีขึ้นหลังลดแรงกดทับแล้ว หรือกลายเป็นแผล ให้ปรึกษาพยาบาลหรือแพทย์"
    ]
  },
  "stage2": {
    name: "แผลกดทับ ระยะที่ 2",
    en: "Partial Thickness Skin Loss",
    summary: "เริ่มมีแผลตื้นๆ บริเวณชั้นหนังแท้ หรือเกิดเป็นตุ่มน้ำพอง",
    detail: "มีการสูญเสียผิวหนังชั้นหนังแท้บางส่วน (Dermis) เป็นแผลเปิดตื้นๆ ฐานแผลมีสีแดงหรือสีชมพูสด และยังไม่มีเนื้อตาย (Slough) ปกคลุม ในบางกรณีอาจพบเป็นตุ่มน้ำพองใส หรือตุ่มน้ำที่แตกแล้ว (Serum-filled blister)",
    todo: [
      "ปรึกษาพยาบาลหรือแพทย์ เพื่อประเมินแผลและรับคำแนะนำเรื่องการทำความสะอาดและวัสดุปิดแผลที่เหมาะสม",
      "ทำความสะอาดแผลตามคำแนะนำของบุคลากรทางการแพทย์ เช่น ใช้น้ำเกลือปราศจากเชื้อ (Normal Saline)",
      "หลีกเลี่ยงการดึงหรือตัดตุ่มน้ำพองด้วยตนเอง",
      "เสริมโภชนาการ โดยเฉพาะอาหารประเภทโปรตีน เพื่อช่วยในการสมานแผล",
      "พลิกตะแคงตัวอย่างสม่ำเสมอทุก 2 ชั่วโมง"
    ]
  },
  "stage3": {
    name: "แผลกดทับ ระยะที่ 3",
    en: "Full Thickness Skin Loss",
    summary: "แผลเปิดลึก มองเห็นชั้นไขมันใต้ผิวหนัง",
    detail: "มีการสูญเสียผิวหนังทั้งหมด ทั้งชั้นหนังกำพร้าและชั้นหนังแท้ (Epidermis และ Dermis) แผลเปิดกว้างและมองเห็นชั้นไขมันใต้ผิวหนังได้ชัดเจน อาจมีหลุมแผล แต่ความลึกยังไม่ถึงชั้นกล้ามเนื้อ เส้นเอ็น หรือกระดูก",
    todo: [
      "พาผู้ป่วยไปพบแพทย์หรือบุคลากรทางการแพทย์ เพื่อทำแผลอย่างถูกต้อง",
      "ทำความสะอาดแผลด้วยเทคนิคปราศจากเชื้อ ตามที่บุคลากรทางการแพทย์แนะนำ",
      "ป้องกันการติดเชื้อแทรกซ้อน และใช้อุปกรณ์ช่วยลดแรงกด เช่น ที่นอนลม",
      "เฝ้าระวังสิ่งคัดหลั่ง กลิ่น หรืออาการอักเสบติดเชื้ออย่างใกล้ชิด"
    ]
  },
  "stage4": {
    name: "แผลกดทับ ระยะที่ 4",
    en: "Full Thickness Skin and Tissue Loss",
    summary: "แผลลึกมากจนเห็นกล้ามเนื้อ เส้นเอ็น หรือกระดูก",
    detail: "เป็นการสูญเสียเนื้อเยื่อผิวหนังและเนื้อเยื่อใต้ผิวหนังทั้งหมด แผลลึกถึงชั้นกล้ามเนื้อ เส้นเอ็น หรือกระดูก มักมีเนื้อตายสีดำหรือสีเหลืองปกคลุมก้นแผล และอาจมีโพรงใต้ขอบแผล (Tunneling / Undermining) เสี่ยงสูงมากต่อการติดเชื้อที่กระดูก (Osteomyelitis) หรือกระแสเลือด",
    todo: [
      "ต้องพบแพทย์ทันที เพื่อรับการรักษาและประเมินการตัดแต่งเนื้อตายโดยเร็วที่สุด",
      "ทำความสะอาดและปิดแผลด้วยวัสดุทางการแพทย์เฉพาะทางตามคำสั่งแพทย์เท่านั้น",
      "ดูแลไม่ให้แผลรับแรงกดทับอย่างเด็ดขาด",
      "ถ้ามีไข้ แผลมีกลิ่นเหม็น หรือมีหนองมาก ให้ไปโรงพยาบาลทันที ถ้าอาการรุนแรงโทร 1669"
    ]
  },
  "unstageable": {
    name: "ประเมินระยะไม่ได้",
    en: "Unstageable",
    summary: "มีเนื้อตายปกคลุมก้นแผลจนมองไม่เห็นความลึก ระบบจึงจัดระยะไม่ได้",
    detail: "เกิดจากมีเนื้อตายสีเหลืองหรือน้ำตาล (Slough) หรือสะเก็ดเนื้อตายสีดำ (Eschar) ปกคลุมก้นแผลทั้งหมด ทำให้ประเมินความลึกที่แท้จริงของแผลไม่ได้ แผลลักษณะนี้ต้องให้บุคลากรทางการแพทย์ตรวจประเมินโดยตรง",
    todo: [
      "ปรึกษาแพทย์ เพื่อประเมินและพิจารณาการตัดแต่งเนื้อตายออก",
      "ไม่ควรลอกหรือแกะเนื้อตายออกเอง",
      "พลิกตัวตามเวลาและลดแรงกดทับบริเวณแผล",
      "เฝ้าระวังอาการติดเชื้อ เช่น มีไข้ แผลมีกลิ่นเหม็น หรือมีหนอง",
      "ถ้าภาพไม่ชัดหรือแสงไม่พอ ลองถ่ายรูปใหม่อีกครั้ง"
    ]
  },
  "normal skin": {
    emoji: "😼",
    name: "ผิวหนังปกติ",
    en: "Normal skin",
    summary: "ไม่พบลักษณะที่คล้ายแผลกดทับในรูปนี้ ผิวหนังดูปกติ",
    detailTitle: "ผิวหนังปกติหมายความว่าอะไร",
    detail: "จากภาพนี้ ระบบไม่พบรอยแดง แผลเปิด หรือเนื้อตายที่คล้ายแผลกดทับ ผิวหนังดูสมบูรณ์ดี อย่างไรก็ตาม ผลนี้ได้จากรูปเพียงรูปเดียว ไม่ได้ยืนยันว่าผิวหนังปลอดภัยแน่นอน เพราะแสง มุมถ่าย และสีผิว อาจทำให้ AI คลาดเคลื่อนได้",
    todoTitle: "การเฝ้าระวังผิวหนัง",
    todo: [
      "ตรวจผิวหนังทุกวัน โดยเฉพาะจุดที่มีปุ่มกระดูก เช่น ก้นกบ สะโพก ส้นเท้า และข้อศอก",
      "ถ้าพบรอยแดง ลองใช้นิ้วกดดู ถ้าสีแดงไม่จางลง ให้ลดแรงกดทับตรงนั้นและถ่ายรูปมาตรวจอีกครั้ง หรือปรึกษาพยาบาล",
      "ผู้ป่วยติดเตียงควรพลิกตัวทุก 2 ชั่วโมง",
      "รักษาผิวให้สะอาดและแห้ง และดูแลเรื่องโภชนาการ",
      "ตรวจซ้ำเป็นประจำ เช่น ทุกครั้งที่เปลี่ยนท่านอนหรือทำความสะอาดร่างกาย"
    ]
  }
};

// ===== 8. แสดงผลลัพธ์ =====
function renderResult(best, seconds) {
  const info = stageInfo[best.className] || {
    name: best.className, en: "", summary: "", detail: "", todo: []
  };

  if (currentUrl) {
    resultThumb.src = currentUrl;
  }
  resultEmoji.textContent = info.emoji || "";
  resultName.textContent = info.name;
  resultEn.textContent = info.en;
  resultSummary.textContent = info.summary;
  resultMeta.textContent =
    "ความมั่นใจของ AI: " + (best.probability * 100).toFixed(1) + "% | ใช้เวลาประมวลผล " + seconds + " วินาที";
  lowConfNote.hidden = !(best.probability < lowConfidence);

  detailTitle.textContent = info.detailTitle || "ลักษณะของแผลในระยะนี้";
  resultDetail.textContent = info.detail;
  todoTitle.textContent = info.todoTitle || "สิ่งที่ผู้ดูแลควรทำ";

  resultTodo.innerHTML = "";
  for (const item of info.todo) {
    const li = document.createElement("li");
    li.textContent = item;
    resultTodo.appendChild(li);
  }

  for (const d of viewResult.querySelectorAll("details")) {
    d.open = false;
  }
}

// ===== 9. โหลดโมเดลตอนเปิดหน้า =====
const MODEL_URL = "model/model.json";
const METADATA_URL = "model/metadata.json";
let model = null;

async function loadModel() {
  statusText.textContent = "กำลังเตรียมระบบ AI กรุณารอสักครู่...";
  try {
    model = await tmImage.load(MODEL_URL, METADATA_URL);
    statusText.textContent = "ระบบ AI พร้อมใช้งาน";
  } catch (error) {
    console.error(error);
    statusText.textContent = "โหลดระบบ AI ไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ";
  }
}
loadModel();

// ===== 10. ปุ่มวิเคราะห์ =====
analyzeBtn.addEventListener("click", async function () {
  if (!model) {
    statusText.textContent = "ระบบ AI ยังโหลดไม่เสร็จ กรุณารอสักครู่";
    return;
  }
  if (!currentUrl) {
    return;
  }

  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
  showView("loading");
  const shownAt = performance.now();

  try {
    const startTime = performance.now();

    // ให้โมเดลอ่านจากสำเนารูปขนาดจริง ไม่ขึ้นกับขนาดที่ CSS ย่อรูปในหน้า
    const img = new Image();
    img.src = currentUrl;
    await img.decode();

    const predictions = await model.predict(img);
    const seconds = ((performance.now() - startTime) / 1000).toFixed(2); // เวลาประมวลผลจริง

    let best = predictions[0];
    for (const p of predictions) {
      if (p.probability > best.probability) {
        best = p;
      }
    }

    // ค้างหน้า "รอสักครู่" ให้ผู้ใช้เห็น (ไม่รวมในเวลาที่แสดงและบันทึก)
    const remain = minLoadingMs - (performance.now() - shownAt);
    if (remain > 0) {
      await new Promise(function (resolve) { setTimeout(resolve, remain); });
    }

    renderResult(best, seconds);
    showView("result");
    console.log("ผลทั้งหมด:", predictions, "เวลาประมวลผลจริง(วินาที):", seconds);
  } catch (error) {
    console.error(error);
    showView("form");
    statusText.textContent = "วิเคราะห์ไม่สำเร็จ ลองเลือกรูปใหม่อีกครั้ง";
  }

  analyzeBtn.disabled = false;
  clearBtn.disabled = false;
});

// ===== 11. ปุ่มตรวจรูปใหม่ =====
retryBtn.addEventListener("click", function () {
  resetPage("");
  showView("form");
});

// ===== 12. ปุ่มลูกศร "อ่านต่อ" (เลื่อนลง และเฟดหายเมื่อเห็นส่วนรายละเอียด) =====
scrollHint.addEventListener("click", function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  moreSection.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
});

const hintObserver = new IntersectionObserver(function (entries) {
  scrollHint.classList.toggle("hide", entries[0].isIntersecting);
}, { threshold: 0.15 });
hintObserver.observe(moreSection);

// ===== 13. ปุ่มโทรโรงพยาบาล (แสดงเมื่อใส่ชื่อและเบอร์ด้านบนสุดของไฟล์แล้ว) =====
if (hospitalName && hospitalTel) {
  callHospital.href = "tel:" + hospitalTel;
  callHospitalText.textContent = "โทร " + hospitalName + " " + hospitalTel;
  callHospital.hidden = false;
}