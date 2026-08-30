const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9u_hM82MrWpPfhiP6p57P-0FxgYeSfPD4ykPq-YbKdlzITg7t1WkNNps6kDcJKzmiycB5SMdzPvbr/pub?gid=0&single=true&output=csv";
const brandConfig = { Starbucks: { color: "#00704A", lightColor: "#E8F5F0", icon: "🟢" }, "TULLY'S": { color: "#8B5A2B", lightColor: "#F5EEE6", icon: "🟤" }, コメダ: { color: "#7B3FB3", lightColor: "#F2EAFB", icon: "🟣" }, "Gong cha": { color: "#D40000", lightColor: "#FCEAEA", icon: "🔴" } };
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
let allData = [];
const filters = { brand: "all", category: "all" };

function getCategoryIcon(category) { return category === "drink" ? "images/drink.png" : category === "food" ? "images/food.png" : "images/other.png"; }
function getCategoryLabel(category) { return category === "drink" ? "ドリンク" : category === "food" ? "フード" : "その他"; }
function shortenText(text = "", max = 5) { return text.length <= max ? text : `${text.slice(0, max)}…`; }
function getDaysDiff(releaseDate) { const today = new Date(); const release = new Date(releaseDate); today.setHours(0, 0, 0, 0); release.setHours(0, 0, 0, 0); return Math.ceil((release - today) / 86400000); }
function getReleaseLabel(date) { const diff = getDaysDiff(date); return diff === 0 ? "🔥 本日発売" : diff === 1 ? "⏰ 明日発売" : diff > 1 ? `📅 あと${diff}日` : "☕ 発売中"; }
function filterData() { return allData.filter(item => (filters.brand === "all" || item.brand === filters.brand) && (filters.category === "all" || item.category === filters.category)); }

function generateCalendar(data) {
  const today = new Date(); let output = "";
  for (let offset = 0; offset <= 1; offset += 1) {
    const target = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = target.getFullYear(), month = target.getMonth(), lastDay = new Date(year, month + 1, 0).getDate();
    let html = `<div><h3 style="font-size:32px;margin:0 0 18px;">${month + 1}月</h3><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;text-align:center;color:#666;font-size:14px;margin-bottom:10px;font-weight:bold;">${weekdays.map(day => `<div>${day}</div>`).join("")}</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">`;
    html += "<div></div>".repeat(target.getDay());
    for (let day = 1; day <= lastDay; day += 1) {
      const date = `${year}/${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
      const events = data.filter(item => item.releaseDate === date);
      const config = events.length ? (brandConfig[events[0].brand] || { lightColor: "#fff" }) : { lightColor: "#fff" };
      const isToday = date === `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
      html += `<div style="background:${config.lightColor};min-height:100px;border-radius:18px;padding:8px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:${isToday ? "2px solid #006241" : "none"};"><div style="text-align:center;font-size:16px;font-weight:bold;">${day}</div>${events.map(item => { const b = brandConfig[item.brand] || { color: "#777" }; return `<a href="detail.html?id=${item.id}" style="text-decoration:none;color:inherit;display:block;margin-top:6px;text-align:center;"><span style="width:36px;height:36px;border-radius:12px;background:${b.color};display:flex;justify-content:center;align-items:center;margin:auto;"><img src="${getCategoryIcon(item.category)}" alt="${getCategoryLabel(item.category)}" style="width:22px;height:22px;"></span><span style="display:block;font-size:11px;font-weight:bold;margin-top:4px;">${shortenText(item.name)}</span></a>`; }).join("")}</div>`;
    }
    output += `${html}</div></div>`;
  }
  return output;
}

function generateUpcoming(data) {
  if (!data.length) return "<h2>発売予定</h2><p class=\"empty-message\">条件に合う商品はありません。</p>";
  return `<h2>発売予定</h2>${data.map(item => { const b = brandConfig[item.brand] || { color: "#777", icon: "☕" }; return `<a href="detail.html?id=${item.id}" style="text-decoration:none;color:inherit;"><article style="background:#fff;border-radius:20px;padding:18px;border-left:6px solid ${b.color};box-shadow:0 2px 8px rgba(0,0,0,.06);"><div style="color:${b.color};font-weight:bold;margin-bottom:8px;">${b.icon} ${item.brand}</div><div style="font-size:22px;font-weight:bold;">${item.name}</div><div style="display:flex;align-items:center;gap:10px;margin-top:8px;color:#666;"><span style="width:36px;height:36px;border-radius:12px;background:${b.color};display:flex;justify-content:center;align-items:center;"><img src="${getCategoryIcon(item.category)}" alt="" style="width:22px;height:22px;"></span>${getCategoryLabel(item.category)}</div><div style="margin-top:8px;">発売日：${item.releaseDate}</div><div style="color:${b.color};font-weight:bold;margin-top:8px;">${getReleaseLabel(item.releaseDate)}</div></article></a>`; }).join("")}`;
}
function renderPage() { const filtered = filterData(); document.getElementById("calendar").innerHTML = generateCalendar(filtered); document.getElementById("upcoming-list").innerHTML = generateUpcoming(filtered); }
function parseCsvLine(line) { const values = []; let value = "", quoted = false; for (let i = 0; i < line.length; i += 1) { if (line[i] === '"') { if (quoted && line[i + 1] === '"') { value += '"'; i += 1; } else quoted = !quoted; } else if (line[i] === "," && !quoted) { values.push(value); value = ""; } else value += line[i]; } values.push(value); return values; }
async function loadData() {
  try { const response = await fetch(CSV_URL); if (!response.ok) throw new Error("データを取得できませんでした。"); const csv = await response.text(); allData = csv.split(/\r?\n/).slice(1).filter(row => row.trim()).map((row, index) => { const cols = parseCsvLine(row); return { id: String(index), releaseDate: cols[1]?.trim(), brand: cols[2]?.trim(), category: cols[3]?.trim(), name: cols[4]?.trim(), description: cols[5]?.trim(), url: cols[6]?.trim() }; }).sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)); renderPage(); }
  catch (error) { document.getElementById("calendar").innerHTML = `<p class="empty-message">${error.message}</p>`; document.getElementById("upcoming-list").innerHTML = ""; }
}
document.querySelectorAll(".filter-btn").forEach(button => button.addEventListener("click", () => { const { filterType, filterValue } = button.dataset; filters[filterType] = filterValue; document.querySelectorAll(`.filter-btn[data-filter-type="${filterType}"]`).forEach(btn => btn.classList.toggle("active", btn === button)); renderPage(); }));
loadData();
