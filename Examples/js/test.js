$(document).ready(function () {
    var myConnector = tableau.makeConnector();

    // Define table schema
    myConnector.getSchema = async function (schemaCallback) {
        try {
            let sqlQuery = tableau.connectionName; // User-provided SQL query
            console.log("User SQL Query:", sqlQuery);

            let cleanedQuery = cleanSQLQuery(sqlQuery);
            console.log("Cleaned SQL Query:", cleanedQuery);

            // Remove LIMIT and ensure LIMIT 1 is present
            let sanitizedQuery = ensureLimitOne(cleanedQuery);
            console.log("Sanitized SQL Query:", sanitizedQuery);

            const apiUrl = "https://twmbiqsat.com/dev/api/generalQuery";
            const requestData = { sql: sanitizedQuery };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': '63633dea0cf24d5c9246a1a381d1b457',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`API Response Failed: Status ${response.status}`);
            }

            const uuid = await response.text();
            console.log("Get UUID from First Request Success.");

            if (uuid) {
                await delay(500); // Wait for data to be processed

                const secondApiUrl = `https://twmbiqsat.com/dev/api/generalQuery/${uuid}`;
                const secondResponse = await fetch(secondApiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': '63633dea0cf24d5c9246a1a381d1b457',
                        'Content-Type': 'application/json',
                    },
                });

                const csvData = await secondResponse.text();
                console.log("Second API Response (CSV):", csvData);

                const metadata = parseCSV(csvData);
                const columnNames = Object.keys(metadata[0]);
                const columns = columnNames.map(field => ({
                    id: field,
                    alias: field,
                    dataType: tableau.dataTypeEnum.string,
                }));

                const tableSchema = {
                    id: "CustomQueryTable",
                    alias: "Custom Query Table",
                    columns: columns,
                };

                schemaCallback([tableSchema]);
            }
        } catch (error) {
            console.error("Failed to fetch metadata:", error);
        }
    };

    // Fetch table data
    myConnector.getData = async function (table, doneCallback) {
        try {
            let sqlQuery = tableau.connectionName; // User-provided SQL query
            console.log("User SQL Query:", sqlQuery);

            let cleanedQuery = cleanSQLQuery(sqlQuery);
            console.log("Cleaned SQL Query:", cleanedQuery);

            const apiUrl = "https://twmbiqsat.com/dev/api/generalQuery";
            const requestData = { sql: cleanedQuery };

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    Authorization: "63633dea0cf24d5c9246a1a381d1b457",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const uuid = await response.text();
            console.log("Get UUID from First Request Success.");

            if (uuid) {
                await delay(5000); // Wait for data to be processed

                const secondApiUrl = `https://twmbiqsat.com/dev/api/generalQuery/${uuid}`;
                const secondResponse = await fetch(secondApiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': '63633dea0cf24d5c9246a1a381d1b457',
                        'Content-Type': 'application/json',
                    },
                });

                const csvData = await secondResponse.text();
                console.log("Second API Response (CSV):", csvData);

                parseCSVInChunks(csvData, 1000, chunk => table.appendRows(chunk));
                doneCallback();
            }
        } catch (error) {
            console.error("Data fetch failed:", error);
            doneCallback();
        }
    };

    tableau.registerConnector(myConnector);

    // Trigger submission dynamically
    $("#result").click(function () {
        const sqlQueryElement = $("#sqlQuery");
        if (!sqlQueryElement.length) {
            console.error("Element with ID 'sqlQuery' not found!");
            return;
        }

        const sqlQuery = sqlQueryElement.val()?.trim() || "";
        if (!sqlQuery) {
            console.warn("User-provided SQL query is empty.");
            return;
        }

        tableau.connectionName = sqlQuery; // Store full SQL query
        tableau.submit();
    });
});

// Utility Functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanSQLQuery(query) {
    return query
        .replace(/--.*?(\r?\n|$)/g, "\n") // Remove comments
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim();
}

function ensureLimitOne(query) {
    query = query.replace(/;\s*$/, ""); // Remove trailing semicolons
    query = query.replace(/\bLIMIT\s+\d+(\s*,\s*\d+)?\b/gi, "").trim(); // Remove LIMIT clauses
    return `${query} LIMIT 1;`; // Add LIMIT 1
}

function parseCSV(csvText) {
    const lines = csvText.split("\n").filter(line => line.trim() !== "");
    const result = [];

    if (lines.length > 1) {
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
            if (columns.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = columns[index];
                });
                result.push(row);
            }
        }
    }

    return result;
}

function parseCSVInChunks(csvText, chunkSize, callback) {
    const lines = csvText.split('\n').filter(line => line.trim() !== "");
    const headers = lines[0].split(',').map(col => col.trim().replace(/"/g, ""));
    let currentIndex = 1; // Skip header line

    function processChunk() {
        const chunk = [];
        for (let i = 0; i < chunkSize && currentIndex < lines.length; i++) {
            const columns = lines[currentIndex].split(',').map(col => col.trim().replace(/"/g, ""));
            if (columns.length >= headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = columns[index] || null;
                });
                chunk.push(row);
            }
            currentIndex++;
        }

        callback(chunk); // Return parsed chunk

        if (currentIndex < lines.length) {
            setTimeout(processChunk, 0); // Recursively process the next chunk
        }
    }

    processChunk();
}
