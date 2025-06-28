# QV (QuickVault) - Free Image Hosting & URL Masking

So this is your **free image hosting and URL masking software** so your images appear like "your images" - for example: `https://i.dhrv.dev/image.png` instead of ugly third-party URLs.

You can use it to host **images and videos** and get their direct share/embed links for media platforms and development. Perfect for Discord, social media, websites, apps, or anywhere you need clean, professional-looking media URLs.

**💰 Cost-Effective**: With just titles (no descriptions), you can upload **over 10 million images for free** using Supabase's generous free tier!

## 🚀 How to Setup (Easy Mode)

**Step 1:** Get [Cursor](https://cursor.com) or any other AI code editor and install the **Supabase MCP** extension on it. Make sure you already have a **Supabase account** - we're going to use the free tier.

**Step 2:** After setting that up, **save all your environment variables** in `.env.local` (required envs are listed below in the technical guide).

**Step 3:** Ask Cursor to **read the codebase and do the rest of the setup** for you - it'll handle database setup, configuration, and deployment.

**Step 4:** After testing locally, **host it on Vercel for free** - it's a Next.js app so deployment is one-click. OH OH OH! You'll need to add the envs to your vercel project as well, otherwise it wont work.

That's it! Your AI assistant will handle the technical setup while you focus on customizing your domain and uploading media.

---

## 🛠️ Technical Guide (For Developers)

### Tech Stack
- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components  
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Catbox.moe integration
- **Deployment**: Vercel-optimized

### Features
- 📸 **Multi-format Support**: Images (JPG, PNG, GIF, WEBP, BMP, SVG) and Videos (MP4, WEBM, MOV, AVI, MKV, etc.)
- 🔗 **Custom URL Masking**: Clean URLs using your domain instead of storage provider URLs
- 📂 **Category Organization**: Organize uploads with custom categories
- 🎯 **Direct Integration**: Upload to Catbox.moe with automatic database indexing
- 📱 **Responsive Design**: Mobile-first design with adaptive layouts
- 🔍 **Search & Filter**: Full-text search and category filtering
- 📊 **Analytics**: View tracking and metadata management
- ⚡ **Performance**: Optimized for speed with proper caching
- 🔐 **Access Control**: Optional passkey verification system

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Access Control
NEXT_PUBLIC_ACCESS_KEY=your_custom_passkey

# Optional: Custom Domain (for URL masking)
NEXT_PUBLIC_CUSTOM_DOMAIN=https://i.yourdomain.com
```

### Database Schema
Run this SQL in your Supabase SQL editor:

```sql
-- Create images table
create table images (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text default 'uncategorized',
  storage_path text not null,
  public_url text not null,
  content_type text not null,
  size_in_bytes bigint not null,
  is_public boolean default true,
  view_count integer default 0,
  user_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (optional)
alter table images enable row level security;

-- Create policy to allow public read access
create policy "Public read access" on images
  for select using (is_public = true);

-- Create policy to allow authenticated insert
create policy "Authenticated insert" on images
  for insert with check (true);

-- Create policy to allow authenticated update/delete
create policy "Authenticated update" on images
  for update using (true);

create policy "Authenticated delete" on images
  for delete using (true);
```

### Installation & Development

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd image-storage
   pnpm install  # or npm install
   ```

2. **Configure Environment**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials
   - Set your custom domain for URL masking

3. **Development Server**
   ```bash
   pnpm dev  # or npm run dev
   ```

4. **Database Setup**
   - Run the SQL schema above in Supabase
   - Or use: `pnpm db:setup` (if you've configured the Supabase CLI)

### File Size Handling

The app intelligently handles different file sizes:

- **≤ 4.5MB**: Direct upload through Next.js API routes
- **> 4.5MB**: Redirects to Catbox.moe for direct upload
- **Manual URLs**: Paste existing Catbox.moe URLs to add to gallery

### URL Masking Configuration

Edit `lib/url-masking.ts` to customize your domain:

```typescript
export function maskCatboxUrl(catboxUrl: string): string {
  const filename = catboxUrl.split('/').pop()
  return `https://i.yourdomain.com/${filename}`
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload file or add Catbox URL |
| `/api/images/[filename]` | GET | Serve masked images |
| `/api/delete` | POST | Delete image from database |
| `/api/edit` | PUT | Update image metadata |
| `/api/categories` | GET | Get all categories |
| `/api/test-db` | GET | Test database connection |

### Deployment

#### Vercel (Recommended)
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add all `.env.local` variables in Vercel dashboard
3. **Custom Domain**: Configure your custom domain in Vercel settings
4. **Deploy**: Automatic deployment on push to main branch

#### Other Platforms
- **Netlify**: Works with minor config adjustments
- **Railway**: Supports Node.js deployments
- **DigitalOcean App Platform**: Compatible with Next.js apps

### Customization

#### Theming
- **Colors**: Edit `tailwind.config.ts` for theme colors
- **Components**: Modify `components/ui/` for component styles
- **Layout**: Customize `app/layout.tsx` and `components/header.tsx`

#### Features
- **Access Control**: Toggle passkey verification in `components/access-check.tsx`
- **Categories**: Modify default categories in `lib/constants.ts`
- **File Types**: Update supported formats in `lib/constants.ts`

### Performance Optimization

- **Image Optimization**: Uses Next.js Image component with lazy loading
- **Database Indexing**: Ensure proper indexes on frequently queried columns
- **Caching**: Static generation for gallery pages
- **CDN**: Vercel Edge Network for global distribution

### Security Features

- **Row Level Security**: Supabase RLS policies for data protection
- **Input Validation**: Server-side validation for all inputs
- **Access Control**: Optional passkey system for private instances
- **CORS**: Properly configured for your domain

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Troubleshooting

**Common Issues:**
- **Database Connection**: Verify Supabase URL and keys
- **File Upload**: Check Vercel function timeout limits
- **URL Masking**: Ensure custom domain is properly configured
- **CORS Errors**: Verify domain settings in Supabase dashboard

**Debug Mode:**
Set `NODE_ENV=development` for detailed error logs.

### License

MIT License - feel free to use this for personal or commercial projects.

### Support

- 📖 **Documentation**: Check the `/docs` folder for detailed guides
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Join GitHub Discussions for questions
- 📧 **Contact**: Open an issue for direct support

---

**Made with ❤️ for developers who need clean, reliable media hosting.**