$(document).ready(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        // 定義資料欄位
        var cols = [
            {
                id: "BI_NBR",
                alias: "BI Number",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "CO_TYPE",
                alias: "Company Type",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "SRC_SYS",
                alias: "Source System",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "BL_IDENTIFY_ID",
                alias: "Bill Identify ID",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "CUST_U_ID",
                alias: "Customer U ID",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "CUST_ONE_ID",
                alias: "Customer One ID",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "OTH_FEE_TYPE",
                alias: "Other Fee Type",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "BI_PRD",
                alias: "Billing Period",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "BI_DT",
                alias: "Billing Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "BI_DUE_DT",
                alias: "Billing Due Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "OTH_FEE_AMT",
                alias: "Other Fee Amount",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "OTH_FEE_TAX",
                alias: "Other Fee Tax",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "DISC_OTH_FEE_AMT",
                alias: "Discounted Other Fee Amount",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "DISC_OTH_FEE_TAX",
                alias: "Discounted Other Fee Tax",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "STAT",
                alias: "Status",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "PM_DT",
                alias: "Payment Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "PAY_DT",
                alias: "Pay Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "PAY_SRL",
                alias: "Pay Serial",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "ACC_DT",
                alias: "Account Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "TO_ERP_AR_DT",
                alias: "To ERP AR Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "TO_BNPL_DT",
                alias: "To BNPL Date",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "RESN_CDE",
                alias: "Reason Code",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "OTH_FEE_DESC",
                alias: "Other Fee Description",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "RMRK",
                alias: "Remark (Masked)",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "PAY_AMT",
                alias: "Pay Amount",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "PAY_TAX",
                alias: "Pay Tax",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "PYMT_UNT_CDE",
                alias: "Payment Unit Code",
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
                "sql": `
                    SELECT 
                        BI_NBR,
                        CO_TYPE,
                        SRC_SYS,
                        BL_IDENTIFY_ID,
                        CUST_U_ID,
                        CUST_ONE_ID,
                        OTH_FEE_TYPE,
                        BI_PRD,
                        BI_DT,
                        BI_DUE_DT,
                        OTH_FEE_AMT,
                        OTH_FEE_TAX,
                        DISC_OTH_FEE_AMT,
                        DISC_OTH_FEE_TAX,
                        STAT,
                        PM_DT,
                        PAY_DT,
                        PAY_SRL,
                        ACC_DT,
                        TO_ERP_AR_DT,
                        TO_BNPL_DT,
                        RESN_CDE,
                        OTH_FEE_DESC,
                        '*******' as RMRK,   --隱碼
                        PAY_AMT,
                        PAY_TAX,
                        PYMT_UNT_CDE
                    FROM OVIEWS.CUS_TIMS_DTL_OTH_FEE;
                `
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
                await delay(5000);

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
                const parsedData = parseCSVInChunks(secondResponseText, 1000, (chunk) => {
                    table.appendRows(chunk)
                })

                // console.log("解析後的資料:", parsedData);

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
    const lines = csvText.split('\n'); // 按换行符分割行
    const result = [];

    if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, "")); // 使用 split 加速处理
            if (columns.length >= 27) { // 确保列数足够
                result.push({
                    BI_NBR: columns[0] || "",
                    CO_TYPE: columns[1] || "",
                    SRC_SYS: columns[2] || "",
                    BL_IDENTIFY_ID: columns[3] || "",
                    CUST_U_ID: columns[4] || "",
                    CUST_ONE_ID: columns[5] || "",
                    OTH_FEE_TYPE: columns[6] || "",
                    BI_PRD: columns[7] || "",
                    BI_DT: columns[8] || "",
                    BI_DUE_DT: columns[9] || "",
                    OTH_FEE_AMT: parseFloat(columns[10] || 0),
                    OTH_FEE_TAX: parseFloat(columns[11] || 0),
                    DISC_OTH_FEE_AMT: parseFloat(columns[12] || 0),
                    DISC_OTH_FEE_TAX: parseFloat(columns[13] || 0),
                    STAT: columns[14] || "",
                    PM_DT: columns[15] || "",
                    PAY_DT: columns[16] || "",
                    PAY_SRL: columns[17] || "",
                    ACC_DT: columns[18] || "",
                    TO_ERP_AR_DT: columns[19] || "",
                    TO_BNPL_DT: columns[20] || "",
                    RESN_CDE: columns[21] || "",
                    OTH_FEE_DESC: columns[22] || "",
                    RMRK: columns[23] || "",
                    PAY_AMT: parseFloat(columns[24] || 0),
                    PAY_TAX: parseFloat(columns[25] || 0),
                    PYMT_UNT_CDE: columns[26] || ""
                });
            }
        }
    }

    return result;

}

function parseCSVInChunks(csvText, chunkSize, callback) {
    const lines = csvText.split('\n').filter(line => line.trim() !== ""); // 過濾空行
    const headers = lines[0].split(',').map(col => col.trim().replace(/"/g, ""));
    let currentIndex = 1; // 跳過標題行

    function processChunk() {
        const chunk = [];
        for (let i = 0; i < chunkSize && currentIndex < lines.length; i++) {
            const columns = lines[currentIndex].split(',').map(col => col.trim().replace(/"/g, ""));
            if (columns.length >= headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = columns[index] || null; // 將資料映射到標題
                });
                chunk.push(row);
            }
            currentIndex++;
        }

        callback(chunk); // 回傳解析的塊

        if (currentIndex < lines.length) {
            setTimeout(processChunk, 0); // 遞迴呼叫處理下一塊
        }
    }

    processChunk();
}
