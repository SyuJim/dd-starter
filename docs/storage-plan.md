# 檔案儲存（Storage）實作規劃

> 本文是**規劃**，尚未動到 `Media` / `payload.config.ts` 的實作。
> 前提假設：這裡的「storage」指**上傳檔案（圖片）的儲存後端**，
> 並以「設計師欄位可放圖片、前台呈現」作為第一個落地情境。
> 若你指的是別的（例如倉儲/庫存管理模組），告訴我，我改寫這份規劃。

---

## 0. 結論摘要

| 項目 | 建議 |
| --- | --- |
| 儲存後端 | 已部署 Vercel → 沿用 **Vercel Blob**；有多雲/搬遷考量 → **Cloudflare R2**（S3 相容，無流出費） |
| 首要修正 | plugin 無條件註冊、`next.config` 沒放行 blob 網域、沒有 MIME/大小限制 |
| 新增 | `Designers` collection（大頭照 + 作品集圖庫）＋前台列表/詳情頁 |
| 預估 | Phase 1～3 約 1.5～2.5 人日 |

---

## 1. 現況盤點

已經有的：

- `src/collections/Media.ts`：upload collection，7 種 `imageSizes`（thumbnail ~ og）、`focalPoint`、`folders: true`。
- `src/payload.config.ts`：已掛 `vercelBlobStorage({ collections: { media: true }, token: BLOB_READ_WRITE_TOKEN })`。
- `src/components/Media/*`：`ImageMedia` / `VideoMedia` 已寫好，走 `getMediaUrl()` + `next/image`。
- `public/media/` 已在 `.gitignore`。

**已知缺口（Phase 1 要處理）：**

| # | 問題 | 影響 |
| --- | --- | --- |
| 1 | `vercelBlobStorage` 無條件註冊，`token` 沒設時是空字串 | 本機開發沒 token 時，上傳會在 adapter 端失敗，且錯誤訊息不直觀 |
| 2 | `Media.upload.staticDir` 指向 `public/media` | 掛了雲端 adapter 後這行等於失效（adapter 會設 `disableLocalStorage`），留著會誤導 |
| 3 | `next.config.ts` 的 `remotePatterns` 只放行自家網域 | Blob 回傳的是 `https://xxx.public.blob.vercel-storage.com/...`，`next/image` 會直接報 hostname 未設定 |
| 4 | `Media` 沒有 `mimeTypes` / 檔案大小限制 | 可上傳任意檔案；圖片欄位可能被塞入非圖片 |
| 5 | `alt` 的 `required` 被註解掉 | 無障礙與 SEO；圖片型 collection 建議至少對外用的要求填寫 |
| 6 | 7 種 `imageSizes` 全開 | 每張圖產生 8 個物件，儲存與轉檔成本偏高，可依實際用到的裁切 |

---

## 2. 儲存後端選擇

| | Vercel Blob | AWS S3 | Cloudflare R2 | 本機磁碟 |
| --- | --- | --- | --- | --- |
| Payload 套件 | `@payloadcms/storage-vercel-blob`（已裝） | `@payloadcms/storage-s3` | `@payloadcms/storage-s3`（S3 相容） | 內建 |
| 設定成本 | 最低（Vercel 上一鍵） | 中（IAM/Bucket policy） | 中 | 無 |
| 流出費用 | 有 | 有（偏貴） | **免流出費** | — |
| CDN | 內建 | 需搭 CloudFront | 內建 | 無 |
| 綁定風險 | 綁 Vercel | 低 | 低 | 不適用 serverless |

**建議**：現階段部署在 Vercel → 沿用 Vercel Blob（成本最低、已裝好）。
未來若要離開 Vercel 或圖片流量變大，改 R2 只需換 adapter 與環境變數，
collection 與前台元件都不用動（這也是 Phase 1 要把設定收斂成單一檔案的原因）。

---

## 3. 分階段實作

### Phase 1 — 讓 storage 真正可用（約 0.5 人日）

1. **抽出 `src/lib/storage/index.ts`**，依環境變數決定 adapter，沒設 token 就退回本機磁碟：

   ```ts
   import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
   import type { Plugin } from 'payload'

   const blobToken = process.env.BLOB_READ_WRITE_TOKEN

   export const storagePlugins: Plugin[] = blobToken
     ? [vercelBlobStorage({ collections: { media: true }, token: blobToken })]
     : [] // 本機：沿用 Payload 內建的 staticDir
   ```

   - 正式環境沒帶 token 時直接 fail fast（build 階段丟錯），比上傳當下才失敗好。

2. **`Media.ts`**：加上 `mimeTypes`、大小上限，`alt` 改必填，並註明 `staticDir` 只在本機生效。

   ```ts
   upload: {
     staticDir: path.resolve(dirname, '../../public/media'), // 僅本機（無 blob token）時使用
     adminThumbnail: 'thumbnail',
     focalPoint: true,
     mimeTypes: ['image/*', 'application/pdf'],
     imageSizes: [ /* 依實際版位精簡 */ ],
   }
   ```

3. **`next.config.ts`**：放行 blob 網域。

   ```ts
   images: {
     remotePatterns: [
       ...,
       { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
     ],
   }
   ```

4. **`.env.example`**：把 `BLOB_READ_WRITE_TOKEN` 從 optional 區塊移到部署必填，補上說明。

**驗收**：本機（無 token）上傳成功且顯示；Vercel 上傳後 URL 為 blob 網域，`next/image` 正常最佳化。

---

### Phase 2 — `Designers` collection（約 0.5～1 人日）

新增 `src/collections/Designers/index.ts`：

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `name` | `text`（required） | 設計師姓名，`useAsTitle` |
| `slug` | `text`（unique, index） | 前台網址 `/designers/[slug]` |
| `title` | `text` | 職稱，例：資深室內設計師 |
| `avatar` | `upload → media`（required） | **大頭照**；`filterOptions` 限定 `mimeType: { contains: 'image' }` |
| `bio` | `richText` | 簡介 |
| `specialties` | `select`（hasMany） | 專長標籤 |
| `portfolio` | `array` | **作品集**，每筆：`image`(upload→media) + `caption` + `year` |
| `social` | `group` | website / instagram / linkedin |
| `featured` | `checkbox` | 是否在首頁露出 |
| `order` | `number` | 排序 |

骨架：

```ts
{
  name: 'avatar',
  type: 'upload',
  relationTo: 'media',
  required: true,
  filterOptions: { mimeType: { contains: 'image' } },
  admin: { description: '建議 1:1、至少 800×800' },
},
{
  name: 'portfolio',
  type: 'array',
  labels: { singular: '作品', plural: '作品集' },
  admin: { components: { RowLabel: '@/collections/Designers/RowLabel' } },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true,
      filterOptions: { mimeType: { contains: 'image' } } },
    { name: 'caption', type: 'text' },
    { name: 'year', type: 'number' },
  ],
}
```

搭配：

- `access`：`read: anyone`、寫入沿用 `authenticated`（與 `Media` 一致）。
- `versions: { drafts: true }` + `authenticatedOrPublished`，讓設計師頁可以走草稿預覽。
- 在 `Posts` 加 `designer` relationship（選配），把文章掛到設計師。
- 加進 `payload.config.ts` 的 `collections`，跑 `pnpm payload migrate:create` 產生 migration，
  再 `pnpm generate:types`。

---

### Phase 3 — 前台呈現（約 0.5～1 人日）

- `src/app/(frontend)/designers/page.tsx`：卡片列表（`avatar` + 姓名 + 職稱），
  用既有 `<Media>` 元件，`size="(max-width: 768px) 100vw, 33vw"`。
- `src/app/(frontend)/designers/[slug]/page.tsx`：大頭照 + 簡介 + 作品集 grid，
  `generateStaticParams` + `generateMeta`（沿用 `src/utilities/generateMeta.ts`）。
- 首頁/Puck：新增 `DesignerGrid` block，讓編輯者可在頁面上放「精選設計師」。
- 記得補 `sitemap`（比照 `posts-sitemap.xml`）。

---

### Phase 4 — 遷移與驗收（約 0.5 人日）

- 既有 `public/media` 檔案搬到 blob：寫一支一次性 script 讀舊檔 → `payload.update` 重新上傳，
  或直接以 `@vercel/blob` 的 `put()` 上傳後更新 `media.url`。
- 測試：
  - integration（vitest）：建立 designer → 帶 avatar → API 回傳 URL 正確。
  - e2e（playwright）：後台上傳圖片、前台 `/designers/[slug]` 圖片 200。
- 監控：Vercel Blob 用量、圖片 404。

---

## 4. 風險與注意事項

- **刪圖不同步**：Payload 刪 media doc 時 adapter 會刪 blob，但被 `Designers.portfolio` 引用中的圖片
  預設仍可刪 → 前台會破圖。建議加 `beforeDelete` hook 擋掉「仍被引用」的圖片。
- **`imageSizes` 一改就要重跑**：既有圖片不會自動補產新尺寸，需要 re-upload 或寫 script。
- **成本**：7 種尺寸 × 每張圖，Blob 是按儲存量 + 流量計費，建議先砍到 3～4 種。
- **多環境共用同一個 bucket**：dev 誤刪會影響正式站，建議 preview/production 分開 token。

## 5. 驗收清單

- [ ] 本機無 `BLOB_READ_WRITE_TOKEN` 也能開發、上傳
- [ ] 正式環境上傳後回傳 blob URL，且 `next/image` 不報 hostname 錯誤
- [ ] 非圖片檔無法被選進 `avatar` / `portfolio.image`
- [ ] `/designers` 與 `/designers/[slug]` 圖片正常、有 SEO meta
- [ ] migration 已產生並可在乾淨資料庫跑起來
