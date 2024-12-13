$(document).ready(function () {
    var myConnector = tableau.makeConnector();

    "date_nkey", "date_dkey", "yr", "yr_mn", "qtr", "mn", "day_of_mn", "day_of_wk", "wk_of_yr", "mn_end_flg", "wk_day_flg", "weekend_flg", "holiday_flg", "billing_day", "week_rng", "week_rng_tcc", "eng_mn", "mbt_bl_ym"

    myConnector.getSchema = function (schemaCallback) {
        // 定義資料欄位
        var cols = [
            {
                id: "date_nkey",
                alias: "Date Nkey",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "date_dkey",
                alias: "Date Dkey",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "yr",
                alias: "Year",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "yr_mn",
                alias: "Year Month",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "qtr",
                alias: "Quarter",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "mn",
                alias: "Month",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "day_of_mn",
                alias: "Day of Month",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "day_of_wk",
                alias: "Day of Week",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "wk_of_yr",
                alias: "Week of Year",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "mn_end_flg",
                alias: "Month End Flag",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "wk_day_flg",
                alias: "Weekday Flag",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "weekend_flg",
                alias: "Weekend Flag",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "holiday_flg",
                alias: "Holiday Flag",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "billing_day",
                alias: "Billing Day",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "week_rng",
                alias: "Week Range",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "week_rng_tcc",
                alias: "Week Range TCC",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "eng_mn",
                alias: "English Month",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "mbt_bl_ym",
                alias: "MBT Billing Year Month",
                dataType: tableau.dataTypeEnum.string
            }
        ];

        // 創建表格 schema 配置
        var tableSchema = {
            id: "Dt_Dt",
            alias: "Dt_Dt",
            columns: cols
        };

        // 回傳 schema
        schemaCallback([tableSchema]);
    };

    myConnector.getData = async function (table, doneCallback) {
        try {
            // 第一個POST請求，發送SQL查詢，並獲取UUID
            var apiUrl = "https://twmbiqsat.com/dev/api/generalQuery";
            var requestData = {
                "sql": "SELECT * FROM bviews.dt_dt limit 10 ;"
            };

            // 發送第一個請求
            const firstResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': '63633dea0cf24d5c9246a1a381d1b457',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            // 將回應作為純文本來處理
            const uuid = await firstResponse.text(); // 假設第一個 API 返回的是 UUID 純文本
            console.log("第一個請求回應 (UUID):", uuid); // 這裡應該是一個 UUID，而不是 JSON

            // 檢查是否有有效的 UUID
            if (uuid && uuid.length > 0) {

                // 等待500毫秒鐘再進行第二個請求
                await delay(500);

                // 第二個GET請求，將UUID插入到URL中
                var secondApiUrl = "https://twmbiqsat.com/dev/api/generalQuery/" + uuid;

                // 發送第二個請求
                const secondResponse = await fetch(secondApiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': '63633dea0cf24d5c9246a1a381d1b457',
                        'Content-Type': 'application/json'
                    }
                });

                // 將回應作為純文本來處理
                const secondResponseText = await secondResponse.text(); // 假設第二個 API 回應是純文本
                console.log("第二個API回應:", secondResponseText);

                // 解析CSV格式的回應
                const parsedData = parseCSV(secondResponseText);
                console.log("解析後的資料:", parsedData);

                // 顯示資料
                table.appendRows(parsedData);
                doneCallback();

            } else {
                // 如果 UUID 不存在或者無效
                console.error("沒有獲取到有效的 UUID");
                $("#status").text("無法獲取有效的 UUID，請求失敗");
            }

        } catch (error) {
            console.error("請求失敗:", error);
            $("#status").text("資料請求失敗，錯誤: " + error.message);
            doneCallback(); // 終止 callback，避免 Tableau 連接器卡住
        }
    };

    tableau.registerConnector(myConnector);

    // 點擊提交按鈕時觸發 Tableau 提交
    $("#submitButton").click(function () {
        tableau.connectionName = "Dt Dt"; // 設置資料連接名稱
        tableau.submit(); // 提交 Tableau 連接
    });
});

// 延遲函數，返回一個 Promise 來讓程式等待
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 解析CSV格式的回應
function parseCSV(csvText) {
    const lines = csvText.split('\n'); // 根據換行符分割行
    const result = [];

    if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (columns && columns.length >= 2) {
                result.push({
                    date_nkey: columns[0].replace(/"/g, ""),
                    date_dkey: columns[1].replace(/"/g, ""),
                    yr: columns[2].replace(/"/g, ""),
                    yr_mn: columns[3].replace(/"/g, ""),
                    qtr: columns[4].replace(/"/g, ""),
                    mn: columns[5].replace(/"/g, ""),
                    day_of_mn: columns[6].replace(/"/g, ""),
                    day_of_wk: columns[7].replace(/"/g, ""),
                    wk_of_yr: columns[8].replace(/"/g, ""),
                    mn_end_flg: columns[9].replace(/"/g, ""),
                    wk_day_flg: columns[10].replace(/"/g, ""),
                    weekend_flg: columns[11].replace(/"/g, ""),
                    holiday_flg: columns[12].replace(/"/g, ""),
                    billing_day: columns[13]?.replace(/"/g, ""),
                    week_rng: columns[14]?.replace(/"/g, ""),
                    week_rng_tcc: columns[15]?.replace(/"/g, ""),
                    eng_mn: columns[16]?.replace(/"/g, ""),
                    mbt_bl_ym: columns[17]?.replace(/"/g, "")
                });
            }
        }
    }

    return result;
}
