const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR9u_hM82MrWpPfhiP6p57P-0FxgYeSfPD4ykPq-YbKdlzITg7t1WkNNps6kDcJKzmiycB5SMdzPvbr/pub?gid=0&single=true&output=csv";

const brandConfig = {
    "Starbucks": {
        color: "#00704A",
        lightColor: "#E8F5F0",
        icon: "🟢"
    },
    "TULLY'S": {
        color: "#8B5A2B",
        lightColor: "#F5EEE6",
        icon: "🟤"
    },
    "コメダ": {
        color: "#7B3FB3",
        lightColor: "#F2EAFB",
        icon: "🟣"
    },
    "Gong cha": {
        color: "#D40000",
        lightColor: "#FCEAEA",
        icon: "🔴"
    }
};

const weekdays =
["日","月","火","水","木","金","土"];

let allData = [];
let currentFilter = "all";

function getCategoryIcon(category) {
    if (category === "drink") return "🥤";
    if (category === "food") return "🍰";
    return "☕";
}

function shortenText(text, max = 5) {
    if (text.length <= max) return text;
    return text.slice(0, max) + "…";
}

function getRemainingDays(releaseDate) {

    const today = new Date();
    const release = new Date(releaseDate);

    today.setHours(0,0,0,0);
    release.setHours(0,0,0,0);

    const diff =
        Math.ceil(
            (release - today)
            / (1000 * 60 * 60 * 24)
        );

    if (diff === 0) return "本日発売";
    if (diff === 1) return "明日発売";
    if (diff > 1) return `あと${diff}日`;

    return "発売中";
}

function filterData() {

    if (currentFilter === "all") {
        return allData;
    }

    return allData.filter(item =>
        item.brand === currentFilter
    );
}

function generateCalendar(data) {

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    let fullCalendar = "";

    for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {

        const targetDate =
            new Date(year, month + monthOffset, 1);

        const targetYear =
            targetDate.getFullYear();

        const targetMonth =
            targetDate.getMonth();

        const firstDay =
            new Date(targetYear, targetMonth, 1);

        const lastDay =
            new Date(targetYear, targetMonth + 1, 0);

        let calendarHTML = `
            <div style="margin-bottom:40px;">

            <h3 style="
                font-size:32px;
                margin-bottom:18px;
            ">
                ${targetMonth + 1}月
            </h3>

            <div style="
                display:grid;
                grid-template-columns:
                repeat(7,1fr);
                gap:8px;
                text-align:center;
                color:#666;
                font-size:14px;
                margin-bottom:10px;
                font-weight:bold;
            ">
                ${weekdays.map(day =>
                    `<div>${day}</div>`
                ).join("")}
            </div>

            <div style="
                display:grid;
                grid-template-columns:
                repeat(7,1fr);
                gap:8px;
            ">
        `;

        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarHTML += `<div></div>`;
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {

            const currentDate =
                `${targetYear}/${
                    String(targetMonth + 1)
                    .padStart(2, "0")
                }/${
                    String(day)
                    .padStart(2, "0")
                }`;

            let eventHTML = "";
            let cellBackground = "#FFFFFF";

            data.forEach(item => {

                if (
                    item.releaseDate
                    === currentDate
                ) {

                    const brandData =
                        brandConfig[item.brand];

                    cellBackground =
                        brandData.lightColor;

                    eventHTML += `
                        <div style="
                            margin-top:6px;
                            text-align:center;
                        ">
                            <div style="
                                display:flex;
                                justify-content:center;
                                gap:6px;
                                font-size:18px;
                                margin-bottom:4px;
                            ">
                                <span>
                                    ${brandData.icon}
                                </span>

                                <span>
                                    ${getCategoryIcon(item.category)}
                                </span>
                            </div>

                            <div style="
                                font-size:11px;
                                font-weight:bold;
                            ">
                                ${shortenText(item.name)}
                            </div>
                        </div>
                    `;
                }
            });

            calendarHTML += `
                <div style="
                    background:
                    ${cellBackground};
                    min-height:100px;
                    border-radius:18px;
                    padding:8px;
                    box-shadow:
                    0 2px 8px
                    rgba(0,0,0,0.06);
                ">
                    <div style="
                        text-align:center;
                        font-size:16px;
                        font-weight:bold;
                    ">
                        ${day}
                    </div>

                    ${eventHTML}
                </div>
            `;
        }

        calendarHTML += `
            </div>
            </div>
        `;

        fullCalendar += calendarHTML;
    }

    return fullCalendar;
}

function generateUpcoming(data) {

    let html =
        `<h2 style="margin-bottom:16px;">
        発売予定
        </h2>`;

    data.forEach(item => {

        const brandData =
            brandConfig[item.brand];

        html += `
            <div style="
                background:white;
                border-radius:20px;
                padding:18px;
                border-left:
                6px solid
                ${brandData.color};
                margin-bottom:14px;
                box-shadow:
                0 2px 8px
                rgba(0,0,0,0.06);
            ">
                <div style="
                    color:
                    ${brandData.color};
                    font-weight:bold;
                    margin-bottom:8px;
                ">
                    ${brandData.icon}
                    ${item.brand}
                </div>

                <div style="
                    font-size:22px;
                    font-weight:bold;
                ">
                    ${item.name}
                </div>

                <div style="
                    color:#666;
                    margin-top:8px;
                ">
                    ${getCategoryIcon(item.category)}
                    ${item.category === "drink"
                        ? "ドリンク"
                        : "フード"}
                </div>

                <div style="
                    margin-top:8px;
                ">
                    発売日：
                    ${item.releaseDate}
                </div>

                <div style="
                    color:
                    ${brandData.color};
                    font-weight:bold;
                    margin-top:8px;
                ">
                    ${getRemainingDays(
                        item.releaseDate
                    )}
                </div>
            </div>
        `;
    });

    return html;
}

function renderPage() {

    const filteredData =
        filterData();

    document.getElementById(
        "calendar"
    ).innerHTML =
        generateCalendar(
            filteredData
        );

    document.getElementById(
        "upcoming-list"
    ).innerHTML =
        generateUpcoming(
            filteredData
        );
}

async function loadData() {

    const response =
        await fetch(CSV_URL);

    const csv =
        await response.text();

    const rows =
        csv.split("\n").slice(1);

    allData = rows
        .filter(row => row.trim())
        .map(row => {

            const cols =
                row.split(",");

            return {
                releaseDate:
                    cols[1]?.trim(),
                brand:
                    cols[2]?.trim(),
                category:
                    cols[3]?.trim(),
                name:
                    cols[4]?.trim()
            };
        });

    // 発売日順ソート
    allData.sort((a, b) => {
        return new Date(a.releaseDate)
            - new Date(b.releaseDate);
    });

    renderPage();

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(button => {

            button
            .addEventListener(
                "click",
                () => {

                document
                .querySelectorAll(
                    ".filter-btn"
                )
                .forEach(btn =>
                    btn.classList
                    .remove(
                        "active"
                    )
                );

                button
                .classList
                .add(
                    "active"
                );

                currentFilter =
                    button.dataset.brand;

                renderPage();
            });
        });
}

loadData();
