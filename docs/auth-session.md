# 登入時效（Session）設定說明

> 對應調整：`src/lib/auth/config.ts`、`src/collections/Users/index.ts`、`src/plugins/index.ts`、`.env.example`

## 1. 這個專案的登入是誰在管？

| 層 | 負責 | 設定位置 |
| --- | --- | --- |
| 真正的 session（cookie + DB `sessions` 表） | **Better Auth** | `src/lib/auth/config.ts` 的 `session` |
| Payload Admin 的前端計時器 / 自家 JWT cookie | Payload | `src/collections/Users/index.ts` 的 `auth.tokenExpiration` |

`Users` collection 設了 `disableLocalStrategy: true` + `betterAuthStrategy()`，
所以**登入狀態的唯一真相是 Better Auth 的 `session_token` cookie 與 `sessions` 資料表**，
Payload 只是透過 strategy 去讀它。

## 2. 目前設定（本次調整後）

```ts
// src/lib/auth/config.ts
session: {
  expiresIn: 60 * 60 * 24 * 30, // 絕對效期 30 天
  updateAge: 60 * 60 * 24,      // 滑動續期：超過 1 天再用到就把效期延長回 30 天
  freshAge: 60 * 60 * 24,       // 敏感操作（改 email、刪帳號）需要的「新鮮度」
}
```

```ts
// src/collections/Users/index.ts
auth: {
  disableLocalStrategy: true,
  strategies: [betterAuthStrategy()],
  tokenExpiration: 60 * 60 * 24 * 30, // 與上面對齊（Payload 預設只有 7200 秒 = 2 小時）
}
```

實際行為：

- **有在用**：每天只要用到一次，效期就一直被推到「今天 +30 天」→ 等同不會被登出。
- **完全沒用**：最後一次使用後滿 30 天才登出。
- ⚠️ **`expiresIn` 只對「新登入」生效**。`sessions.expires_at` 是登入當下寫進資料庫的，
  改設定不會回頭修改既有 session。**要驗證請先登出再登入。**

## 3. 大家通常設多久？

| 情境 | 常見設定 | 備註 |
| --- | --- | --- |
| Better Auth 預設 | 7 天 + 1 天滑動續期 | 框架預設值 |
| Payload 預設 | **2 小時** | `tokenExpiration: 7200`，這是很多人覺得「一下就被登出」的來源 |
| 一般 SaaS / CMS 後台 | **7～30 天滑動** | 最主流；本專案取 30 天 |
| 消費型 App / 電商會員 | 30～90 天 | 通常搭配「記住我」 |
| 內含個資 / 金流 / 醫療 | 15～30 分鐘閒置 + 8～12 小時絕對上限 | 合規要求 |

**建議**：後台維持 30 天滑動即可；若之後管理端會碰到客戶個資或金流，
再把 admin 角色縮到 7 天，並開 2FA（本專案已裝 `twoFactor()`）。

## 4. 如果改完還是「很快被登出」，照這個順序查

設定值本來就已經是 30 天，所以「很快被登出」多半不是效期問題，而是 **cookie 沒被帶回來**。
由高到低的機率：

1. **舊 session 沒重登**
   `expires_at` 是登入當下算的。先完整登出 → 重新登入，再看
   `SELECT id, expires_at FROM sessions ORDER BY id DESC LIMIT 5;` 是不是 +30 天。

2. **網域 / 通訊協定變動（最常見）**
   - `pnpm dev` 走的是 `--experimental-https`，網址是 **https**://localhost:3000，
     但 `.env` 若寫 `http://localhost:3000`，cookie 的 origin 就對不上。
   - Vercel **preview 部署每次網域都不同** → cookie 綁在舊網域上，看起來就像被登出。
     本次已把 `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` 加進 `trustedOrigins`。

3. **`BETTER_AUTH_URL` 沒設對**
   Better Auth 只會自己讀 `BETTER_AUTH_URL`，**不吃 `BETTER_AUTH_BASE_URL`**
   （原本 `.env.example` 寫的是後者，等於沒設，baseURL 只能從每個 request 猜）。
   本次已改名，並在 `src/plugins/index.ts` 明確傳 `baseURL`。

4. **`BETTER_AUTH_SECRET` 換過或沒設**
   cookie 是用這把 secret 簽的，換掉 = 全站立刻登出。
   各環境要固定，且正式站一定要設（沒設會用預設值，Better Auth 在 production 會直接拋錯）。

5. **瀏覽器層面**
   關閉分頁就掉 → cookie 沒有 `maxAge`（Better Auth 只有在 `rememberMe: false` 時才這樣，
   目前的登入畫面沒有送這個參數，預設是 `true`）。可在 DevTools → Application → Cookies
   確認 `better-auth.session_token` 的 Expires 欄位是不是約 30 天後。

### 檢查指令

```sql
-- session 實際效期
SELECT id, user_id, created_at, expires_at, expires_at - now() AS remaining
FROM sessions ORDER BY id DESC LIMIT 10;
```

## 5. 兩個「看起來能用、但這裡不要開」的選項

- **`admin.autoRefresh: true`（Payload）**
  它會定時打 `POST /api/users/refresh-token`。本專案 `disableLocalStrategy: true`，
  Payload 沒有自己的 token 可 refresh，該請求失敗時 Admin 端會直接把人踢去 inactivity 頁——
  反而製造登出。Better Auth 的 `updateAge` 已經在做滑動續期了，不需要它。

- **`session.cookieCache`（Better Auth）**
  用簽章 cookie 快取 session、少打 DB，效能有感。但代價是「改權限 / 撤銷 session」
  最久要等 `maxAge` 才生效，而 Payload 的 access control 全靠 `req.user`。
  程式碼裡留了註解掉的設定，要開再打開（建議 `maxAge: 60`）。
