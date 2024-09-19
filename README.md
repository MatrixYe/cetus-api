<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 描述
[接口文档](https://console-docs.apipost.cn/preview/b25b3aa44bbbdd15/25154e90fafad423) Cetus Api Server

## 安装与部署
### 执行环境 
- 需要在本机安装node.js环境
### 下载
```bash
git clone https://github.com/MatrixYe/cetus-app.git
```
### 创建 `.env`文件
进入项目根目录,创建一个新文件，命名`.env`，将下面内容复制到文件内
```dotenv
#程序名称，随便
APP_NAME="Cetus-API"
#端口
APP_PORT=5088

# Sui节点URL，（替换成你的节点）
ENDPOINT_URL="https://demo.com"

#目标sui网络，mainnet:主网，devnet:测试网,(不要修改)
NETWORK="mainnet"

# 钱包地址(替换成你的钱包地址)
SENDER_ADDRESS="0x...."

# 钱包私钥(替换成记得私钥，注意与地址匹配)
SECRET_KEY="abcd...."

```
### 运行
请在单独终端运行程序！例如使用`tmux`创建后台执行窗口
```bash
#下载依赖包
npm install
# 编译
npm run build
# 运行
npm run start:prod
```
程序运行后，接口服务端口为5009。

### 或者使用docker运行！！，记得先配置好.env文件
```bash
# 进入根目录
# 编译镜像
docker build -t cetus-app .
# 运行镜像
docker run -itd -p 5009:5009 --name cetus-app cetus-app
# 查看容器
docker ps -a
# 停止容器
docker stop cetus-app
# 重启容器
docker start cetus-app
# 移除容器
docker rm -f cetus-app

```

[接口文档地址](https://console-docs.apipost.cn/preview/b25b3aa44bbbdd15/25154e90fafad423)
