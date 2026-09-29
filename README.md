Dear Vic：
我多年來規劃代孕生子，預計代理孕母將於115年12月18日生產，而預計115年12月出發至美國加州洛杉磯迎接寶寶出生，同時預計116年1月30日前返回台灣，在這粗估1.5個月期間除了應變寶寶提前出生狀況115年12月8日飛加州安大略機場、安置位於洛杉磯EL Monte（艾爾蒙地）的租屋育兒環境、MemorialCare Saddleback Medical Center醫院接生（位於加州-拉古納山Laguna Hills, CA）、嬰兒搭飛機回國醫療評估、預防針注射之外；
尚須（1）持醫院提供出生紙至公共衛生部生命記錄辦公室（Virtual Record Office）申請出生證明，預計辨理行政作業約需花1~2周；接著，
（2）由雙親及寶寶親自持出生證明至洛杉磯護照辦事處（Los Angeles Passport Agency）辦理回台護照，急件處理約需等待5~7天；同時，
（3）將出生證明文件、雙親及小孩護照、疫苗證明、孕母代孕合約及合法代理孕母最關鍵的法律文件-出生前親權判決（Pre-Birth Order）親自送件「駐洛杉磯臺北經濟文化辦事處（Taipei Economic and Cultural Office，臺北經濟文化代表處／辦事處）」辦理認證，預計需等待1周時間；
最後，（4）再至美國社會安全局（Social Security）申請美國社會安全號碼（Social Security Number）；依代孕家庭支持團體們的分享及建議上述行政申請及作業等待期間約1~1.5個月左右，另又剛好遇到美國聖誕節及新年12月假期期間行政部分恐都在放假，因此預估會有1.5個月左右暫時無法到公司上班，而我也深知目前部們正在研發CRISP3 TCM專案Board板，我也在當中擔任研發角色，而如何工作又同時兼顧家庭是我最放不下的目標，也因此寫這封信，想尋求主管協助及建議的地方。

除了使用特休假是種照顧家庭，但無法兼顧到工作及公司的方法外；為了能夠同時兼顧工作與家庭，我擬詢問主管是否可使用「遠距連線上班」方式來解決處理工作事務，且上述(1)~(4)的文件申請通常不占太多時間，反而較多消耗在等待文件審核作業，那麼多出來時間剛好可以拿來處理工作上事務；另再考量，雖加州冬季約慢台灣16小時，我也會全力配合台灣上班及上線時間處理公務；為了讓在這段期間不影響團隊及工作交付進度，這或許是個兩全其美方案？
感謝主管耐心地看完此份信件，倘若依主管評斷後此方案不可行或有更適合的方案，因此也要再請主管依實際狀況給予建議及指點，謝謝。
# DD Starter

A modern Payload CMS starter template featuring visual page editing, hierarchical content management, and enhanced authentication. Built and maintained by [Delmare Digital](https://delmaredigital.com).

This template serves as a working demonstration of the `@delmaredigital` plugin ecosystem for Payload CMS.

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdelmaredigital%2Fdd-starter&project-name=my-payload-site&build-command=pnpm%20run%20ci&env=PAYLOAD_SECRET,BETTER_AUTH_SECRET&stores=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="32"></a>
</p>

## Included Plugins

### [@delmaredigital/payload-puck](https://github.com/delmaredigital/payload-puck)
Visual page builder powered by [Puck](https://puckeditor.com). Create pages with a drag-and-drop interface instead of traditional block-based editing.

- Visual WYSIWYG page editing
- Pre-built components (Section, Flex, Grid, Heading, Text, Button, etc.)
- Multiple page layouts (Default, Full Width, Landing)
- Live preview in editor
- Server-side rendering support

### [@delmaredigital/payload-page-tree](https://github.com/delmaredigital/payload-page-tree)
Hierarchical content organization with automatic slug generation.

- Visual tree view for content hierarchy
- Folder-based URL structure
- Auto-generated slugs from path segments
- Works with Pages and Posts collections

### [@delmaredigital/payload-better-auth](https://github.com/delmaredigital/payload-better-auth)
Enhanced authentication using [Better Auth](https://better-auth.com).

- Email/password authentication
- Passkey/WebAuthn support
- Two-factor authentication (TOTP)
- API key management
- Role-based access control

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **CMS**: [Payload CMS 3](https://payloadcms.com)
- **Database**: PostgreSQL (via Vercel Postgres/Neon)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Storage**: Vercel Blob Storage

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Configure your environment variables (see below)
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```
   The database schema is automatically synced in development mode (push mode).

### Environment Variables

Required:
- `POSTGRES_URL` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Secret for JWT signing (min 32 chars)
- `BETTER_AUTH_SECRET` - Secret for Better Auth (min 32 chars)

Optional:
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `PUCK_API_KEY` - For Puck AI page generation (from [puckeditor.com](https://puckeditor.com))

## Project Structure

```
src/
├── app/(frontend)/     # Next.js frontend routes
├── app/(payload)/      # Payload admin routes
├── collections/        # Payload collections (Posts, Media, Users)
├── components/         # React components
├── lib/
│   ├── auth/          # Better Auth configuration
│   └── puck/          # Puck layouts and options
├── puck/              # Puck editor configuration
└── plugins/           # Payload plugin configuration
```

## Usage

### Creating Pages

1. Navigate to `/admin/page-tree`
2. Click "New Page" to create a page
3. Use the Puck visual editor to build your page layout
4. Publish when ready

### Managing Content Hierarchy

The Page Tree view (`/admin/page-tree`) provides a visual interface for organizing your content. Drag pages to reorder or nest them within folders.

### Authentication and roles

Better Auth handles sign-in; Payload's admin panel manages users. Public sign-up is enabled, so the role model is deliberately strict:

| Role | Admin panel | Author content (pages, posts, media, globals, redirects, templates, folders) | Read published content |
|------|-------------|-----------------------------------------------------------------------------|------------------------|
| `admin` | yes | yes | yes |
| `user` | no | no | yes |
| anonymous | no | no | yes |

The first account created becomes `admin`; every later sign-up is a `user` and cannot set its own role. Drafts, version history, the Page Tree endpoints, the job runner and draft preview are all admin-only. The access helpers live in `src/access/` and the integration tests in `tests/int/cms-access.int.spec.ts` pin this matrix.

## Development

```bash
# Start dev server
pnpm dev

# Type check + lint
pnpm check

# Integration tests (needs POSTGRES_URL; CI runs them against a Postgres service)
pnpm test:int

# Build for production
pnpm build

# Run production build
pnpm start
```

## Deploying to Vercel

This template is ready to deploy to Vercel:

1. Push your repository to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. **Important**: Override the build command to `pnpm run ci`

The `ci` script runs migrations before building, which is required for production deployments.

## Database Migrations

The project uses **push mode** in development, which automatically syncs schema changes.

For production, migrations are created once and included in the repository. If you make schema changes:

```bash
# Create a new migration
pnpm payload migrate:create
```

## License

MIT

---

Built by [Delmare Digital](https://delmaredigital.com)
