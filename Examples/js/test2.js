$(document).ready(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        // 定義資料欄位
        var cols = [
            {
                id: "contr_stat_cde",
                alias: "Contr Stat Cde",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "contr_stat_desc",
                alias: "Contr Stat Desc",
                dataType: tableau.dataTypeEnum.string
            }
        ];

        // 創建表格 schema 配置
        var tableSchema = {
            id: "Contr_Stat",
            alias: "Contr_Stat",
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
                "sql": "SELECT * FROM bviews.dt_contr_stat limit 10 ;"
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
        tableau.connectionName = "Contr Stat"; // 設置資料連接名稱
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
                    contr_stat_cde: columns[0].replace(/"/g, ""),
                    contr_stat_desc: columns[1].replace(/"/g, "")
                });
            }
        }
    }

    return result;
}
