# 使用 Nginx 镜像
FROM nginx:alpine

# 清理默认的 HTML 文件
RUN rm -rf /usr/share/nginx/html/*

# 复制你的 WDC 文件到 Nginx 目录
COPY . /usr/share/nginx/html/

# 暴露 Nginx 默认端口
EXPOSE 80
