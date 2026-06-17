/**
 * Google Apps Script สำหรับเขียนสถานะการเซ็นกลับไปที่ Google Sheet
 *
 * วิธีติดตั้ง:
 * 1) เปิด Google Sheet ที่ใช้งาน -> เมนู Extensions -> Apps Script
 * 2) ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดนี้แทน
 * 3) แก้ค่า SHEET_NAME ให้ตรงกับชื่อชีต (ค่าเริ่มต้น "หนังสือ")
 *    และตั้ง TOKEN เป็นรหัสลับของคุณเอง (ต้องตรงกับ APPS_SCRIPT_TOKEN ในเว็บ)
 * 4) เมนู Deploy -> New deployment -> ประเภท "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    แล้วคัดลอก URL ที่ได้ ไปใส่ APPS_SCRIPT_URL ในไฟล์ .env.local ของเว็บ
 */

var SHEET_NAME = "หนังสือ";
var TOKEN = "เปลี่ยนรหัสนี้ให้ตรงกับ-APPS_SCRIPT_TOKEN";

// ชื่อหัวคอลัมน์ (ต้องตรงกับใน Sheet)
var COL = {
  docNo: "เลขที่",
  status: "สถานะ",
  approverName: "ผู้เซ็นอนุมัติ",
  signedDate: "วันที่เซ็น",
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) {
      return json({ ok: false, error: "token ไม่ถูกต้อง" });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return json({ ok: false, error: "ไม่พบชีต " + SHEET_NAME });

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var cNo = headers.indexOf(COL.docNo);
    var cStatus = headers.indexOf(COL.status);
    var cApprover = headers.indexOf(COL.approverName);
    var cDate = headers.indexOf(COL.signedDate);

    if (cNo < 0) return json({ ok: false, error: "ไม่พบคอลัมน์ " + COL.docNo });

    var target = String(body.docNo).trim();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][cNo]).trim() === target) {
        var rowNum = i + 1; // 1-based + header
        if (cStatus >= 0 && body.status) sheet.getRange(rowNum, cStatus + 1).setValue(body.status);
        if (cApprover >= 0 && body.approverName) sheet.getRange(rowNum, cApprover + 1).setValue(body.approverName);
        if (cDate >= 0 && body.signedDate) sheet.getRange(rowNum, cDate + 1).setValue(body.signedDate);
        return json({ ok: true });
      }
    }
    return json({ ok: false, error: "ไม่พบหนังสือเลขที่ " + target });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
