const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR9u_hM82MrWpPfhiP6p57P-0FxgYeSfPD4ykPq-YbKdlzITg7t1WkNNps6kDcJKzmiycB5SMdzPvbr/pub?gid=0&single=true&output=csv";

const brandConfig = {
    "Starbucks": {
        color: "#00704A",
        icon: "🟢"
    },
    "TULLY'S": {
        color: "#8B5A2B",
        icon: "🟤"
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

function getCategoryText(category) {

    if (category === "drink") {
        return "🥤 ドリンク";
    }

    if (category === "food") {
        return "🍰 フード";
    }

    return "☕ その他";
}

async function loadDetail() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    const response =
        await fetch(CSV_URL);

    const csv =
        await response.text();

    const rows =
        csv.split("\n").slice(1);

    const products =
        rows
        .filter(row => row.trim())
        .map((row, index) => {

            const cols =
                row.split(",");

            return {
                id: String(index),
                releaseDate:
                    cols[1]?.trim(),
                brand:
                    cols[2]?.trim(),
                category:
                    cols[3]?.trim(),
                name:
                    cols[4]?.trim(),
                description:
                    cols[5]?.trim(),
                url:
                    cols[6]?.trim()
            };
        });

    const product =
        products.find(
            item => item.id === id
        );

    if (!product) {

        document
        .getElementById(
            "detail-container"
        )
        .innerHTML = `
            <h2>
                商品が見つかりません
            </h2>
        `;

        return;
    }

    const brandData =
        brandConfig[
            product.brand
        ] || {
            color:"#999",
            icon:"☕"
        };

    document
    .getElementById(
        "detail-container"
    )
    .innerHTML = `
        <div style="
            background:white;
            border-radius:24px;
            padding:24px;
            box-shadow:
            0 4px 16px
            rgba(0,0,0,0.08);
        ">

            <div style="
                color:
                ${brandData.color};
                font-weight:bold;
                margin-bottom:12px;
            ">
                ${brandData.icon}
                ${product.brand}
            </div>

            <h2 style="
                font-size:30px;
                margin-bottom:16px;
            ">
                ${product.name}
            </h2>

            <div style="
                margin-bottom:10px;
                color:#666;
            ">
                ${getCategoryText(
                    product.category
                )}
            </div>

            <div style="
                margin-bottom:18px;
                color:#666;
            ">
                📅
                ${product.releaseDate}
            </div>

            <div style="
                line-height:1.8;
                margin-bottom:24px;
            ">
                ${
                    product.description
                    || "説明は準備中です"
                }
            </div>

            <a
                href="${product.url}"
                target="_blank"
                style="
                    display:block;
                    background:
                    ${brandData.color};
                    color:white;
                    text-align:center;
                    padding:16px;
                    border-radius:16px;
                    text-decoration:none;
                    font-weight:bold;
                    margin-bottom:12px;
                "
            >
                公式サイトを見る
            </a>

            <button
                onclick="history.back()"
                style="
                    width:100%;
                    border:none;
                    background:#eee;
                    padding:14px;
                    border-radius:16px;
                    cursor:pointer;
                "
            >
                ← 戻る
            </button>
        </div>
    `;
}

loadDetail();
