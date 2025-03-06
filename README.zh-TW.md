# Popnacho 後端

## 端點

### 驗證

*   `POST /auth/register`: 註冊新使用者帳號，需要使用者名稱和密碼。
    *   註冊新使用者帳號。需要一個獨特的使用者名稱和密碼。
*   `POST /auth/login`: 使用者名稱和密碼登入。
    *   使用使用者名稱和密碼登入現有使用者。
*   `GET /auth/google`: 重新導向至 Google 進行驗證。
    *   將使用者重新導向至 Google 的驗證頁面以進行 Google 登入。
*   `GET /auth/google/callback`: Google 驗證的 Callback URL。
    *   Google 在驗證成功或失敗後重新導向的 Callback URL。
*   `GET /auth/discord`: 重新導向至 Discord 進行驗證。
    *   將使用者重新導向至 Discord 的驗證頁面以進行 Discord 登入。
*   `GET /auth/discord/callback`: Discord 驗證的 Callback URL。
    *   Discord 在驗證成功或失敗後重新導向的 Callback URL。

### 排行榜

*   `GET /leaderboard`: 取得依 pop 數排名的前 100 名使用者。
    *   取得依 pop 數排名的前 100 名使用者。
*   `GET /leaderboard/user/rank`: 取得目前使用者在排行榜中的排名。
    *   取得目前使用者在排行榜中的排名。需要驗證。
*   `GET /leaderboard/user/rank/nearby`: 取得排行榜中目前使用者排名附近的 20 位使用者。
    *   取得排行榜中目前使用者排名附近的 20 位使用者。需要驗證。

## 設定

需要下列環境變數：

*   `PORT`: 伺服器將監聽的 Port（預設值：3000）。
    *   伺服器將監聽連入連線的 Port。如果未指定，則預設為 3000。
*   `MONGODB_URI`: MongoDB 資料庫的 URI。
    *   用於連線至 MongoDB 資料庫的連線字串。
*   `REDIS_HOST`: Redis 伺服器的主機。
    *   Redis 伺服器的主機名稱或 IP 位址。
*   `REDIS_PORT`: Redis 伺服器的 Port。
    *   Redis 伺服器的 Port。
*   `GOOGLE_CLIENT_ID`: Google OAuth 的客戶端 ID。
    *   從 Google 開發人員主控台取得的 Google OAuth 驗證客戶端ID。
*   `GOOGLE_CLIENT_SECRET`: Google OAuth 的客戶端密碼。
    *   從 Google 開發人員主控台取得的 Google OAuth 驗證客戶端密碼。
*   `DISCORD_CLIENT_ID`: Discord OAuth 的客戶端 ID。
    *   從 Discord 開發人員入口網站取得的 Discord OAuth 驗證客戶端 ID。
*   `DISCORD_CLIENT_SECRET`: Discord OAuth 的客戶端密碼。
    *   從 Discord 開發人員入口網站取得的 Discord OAuth 驗證客戶端密碼。
*   `SESSION_SECRET`: 用於簽署工作階段 Cookie 的密鑰。
    *   用於簽署工作階段 ID Cookie 的隨機產生字串，可增強安全性。

## 執行後端

1.  安裝相依性：`npm install`
2.  在 `.env` 檔案中設定環境變數。
3.  執行伺服器：`node index.js`
