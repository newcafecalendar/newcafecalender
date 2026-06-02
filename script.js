const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR9u_hM82MrWpPfhiP6p57P-0FxgYeSfPD4ykPq-YbKdlzITg7t1WkNNps6kDcJKzmiycB5SMdzPvbr/pub?gid=0&single=true&output=csv";

async function loadData() {
    try {
        const response = await fetch(CSV_URL);
        const csv = await response.text();

        const rows = csv.split("\n").slice(1);

        let html = "";

        rows.forEach(row => {
            if (!row.trim()) return;

            const cols = row.split(",");

            const releaseDate = cols[1] || "";
            const brand = cols[2] || "";
            const category = cols[3] || "";
            const name = cols[4] || "";

            html += `
                <div style="
                    background:white;
                    margin-bottom:10px;
                    padding:12px;
                    border-radius:12px;
                ">
                    <strong>${name}</strong><br>
                    ${brand}<br>
                    ${category}<br>
                    発売日：${releaseDate}
                </div>
            `;
        });

        document.getElementById("upcoming-list").innerHTML = html;

        document.getElementById("calendar").innerHTML =
            "カレンダー実装準備中";

    } catch (error) {

        document.getElementById("calendar").innerHTML =
            "データ取得失敗";

        console.error(error);
    }
}

loadData();
