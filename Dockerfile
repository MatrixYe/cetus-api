# 使用官方 Node.js 基础镜像
FROM node:21.6.2

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 编译 TypeScript 代码
RUN npm run build

# 暴露容器运行时的端口号
EXPOSE 5009

# 运行应用
CMD ["node", "dist/main"]
