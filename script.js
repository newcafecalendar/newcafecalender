const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR9u_hM82MrWpPfhiP6p57P-0FxgYeSfPD4ykPq-YbKdlzITg7t1WkNNps6kDcJKzmiycB5SMdzPvbr/pub?gid=0&single=true&output=csv";

async function loadData() {
    try {
        const response = await fetch(CSV_URL);
        const csv = await response.text();

        document.getElementById("calendar").innerHTML =
            "スプレッドシート接続成功";

        document.getElementById("upcoming-list").innerHTML =
            "データ取得成功";

        console.log(csv);

    } catch (error) {

        document.getElementById("calendar").innerHTML =
            "データ取得失敗";

        console.error(error);
    }
}

loadData();
