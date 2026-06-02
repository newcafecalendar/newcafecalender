const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR9u_hM82MrWpPfhiP6p57P-0FxgYeSfPD4ykPq-YbKdlzITg7t1WkNNps6kDcJKzmiycB5SMdzPvbr/pub?gid=0&single=true&output=csv";

const brandConfig = {
    "Starbucks": {
        color: "#00704A",
        icon: "🟢"
    },
    "TULLY'S": {
        color: "#C87B00",
        icon: "🟠"
    },
    "コメダ": {
        color: "#7B3FB3",
        icon: "🟣"
    },
    "Gong cha": {
        color: "#D40000",
        icon: "🔴"
    }
};

function getCategoryIcon(category) {
    if (category === "drink") return "🥤";
    if (category === "food") return "🍰";
    return "☕";
}

function getRemainingDays(releaseDate) {
    const today = new Date();
    const release = new Date(releaseDate);

    today.setHours(0,0,0,0);
    release.setHours(0,0,0,0);

    const diff =
        Math.ceil((release - today) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "本日発売";
    if (diff === 1) return "明日発売";
    if (diff > 1) return `あと${diff}日`;

    return "発売中";
}

async function loadData() {
    try {
        const response = await fetch(CSV_URL);
        const csv = await response.text();

        const rows = csv.split("\n").slice(1);

        let html = "";

        rows.forEach(row => {
            if (!row.trim()) return;

            const cols = row.split(",");

            const releaseDate = cols[1]?.trim() || "";
            const brand = cols[2]?.trim() || "";
            const category = cols[3]?.trim() || "";
            const name = cols[4]?.trim() || "";

            const brandData =
                brandConfig[brand] || {
                    color: "#999",
                    icon: "☕"
                };

            html += `
                <div style="
                    background:white;
                    margin-bottom:12px;
                    padding:16px;
                    border-radius:16px;
                    border-left:6px solid ${brandData.color};
                    box-shadow:0 2px 8px rgba(0,0,0,0.08);
                ">
                    <div style="
                        font-size:14px;
                        color:${brandData.color};
                        font-weight:bold;
                        margin-bottom:8px;
                    ">
                        ${brandData.icon} ${brand}
                    </div>

                    <div style="
                        font-size:20px;
                        font-weight:bold;
                        margin-bottom:8px;
                    ">
                        ${name}
                    </div>

                    <div style="
                        color:#555;
                        margin-bottom:8px;
                    ">
                        ${getCategoryIcon(category)}
                        ${category}
                    </div>

                    <div style="
                        color:#666;
                        margin-bottom:4px;
                    ">
                        発売日：${releaseDate}
                    </div>

                    <div style="
                        color:${brandData.color};
                        font-weight:bold;
                    ">
                        ${getRemainingDays(releaseDate)}
                    </div>
                </div>
            `;
        });

        document.getElementById("upcoming-list").innerHTML =
            html;

        document.getElementById("calendar").innerHTML =
            "カレンダー実装準備中";

    } catch (error) {

        document.getElementById("calendar").innerHTML =
            "データ取得失敗";

        console.error(error);
    }
}

loadData();
