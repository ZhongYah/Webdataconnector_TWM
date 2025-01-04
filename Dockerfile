# 使用官方 node 映像
FROM node:14

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程式代碼
COPY . .

# 設置應用程式運行的端口
EXPOSE 8888

# 啟動應用程式
CMD ["npm", "start"]
