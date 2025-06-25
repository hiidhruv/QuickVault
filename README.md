# Image & Video Hosting Platform

A modern, simple media hosting platform built with Next.js that allows users to upload, organize, and share images and videos with custom URL masking.

## Features

- 📸 **Image & Video Upload**: Support for images (JPG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV, AVI, etc.)
- 🔗 **Custom URL Masking**: Clean URLs using your own domain
- 📂 **Category Organization**: Organize uploads by custom categories
- 🎯 **Direct Integration**: Upload directly to Catbox.moe with automatic database indexing
- 🗄️ **Database Storage**: All metadata stored in Supabase for fast browsing
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🎨 **Modern UI**: Clean, intuitive interface built with shadcn/ui
- 🔍 **Search & Filter**: Find your media by title, description, or category
- 📊 **View Tracking**: Track views for each uploaded file
- ⚡ **Fast Performance**: Optimized loading and responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Catbox.moe integration
- **Deployment**: Vercel-ready

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-storage
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the SQL schema in your Supabase project:
   ```sql
   create table images (
     id uuid default gen_random_uuid() primary key,
     title text,
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
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Uploading Media

1. **Direct Upload**: Drag & drop or select images/videos up to 4.5MB
2. **Large Files**: For files >4.5MB, use the direct Catbox.moe upload option
3. **Manual URL**: Already have a Catbox.moe URL? Paste it to add to your gallery

### Organization

- **Categories**: Create custom categories or use existing ones
- **Search**: Find media by title, description, or category
- **Filtering**: Filter by category in the gallery view

### Sharing

- **Direct Links**: Each upload gets a clean, shareable URL
- **URL Masking**: Catbox.moe URLs are automatically masked with your domain
- **Embedding**: Direct links work for embedding in other websites

## API Endpoints

- `GET /api/upload` - List all uploads
- `POST /api/upload` - Upload new file or add Catbox.moe URL
- `GET /api/categories` - Get all categories
- `POST /api/delete` - Delete an upload (database only)

## Customization

### URL Masking
Edit `lib/url-masking.ts` to customize your domain:
```typescript
return `https://your-domain.com/${filename}`
```

### Styling
The project uses Tailwind CSS and shadcn/ui. Customize:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles
- `components/ui/` - Component styles

## File Size Limits

- **Automatic Upload**: Up to 4.5MB (Vercel serverless limit)
- **Direct Upload**: Unlimited (redirects to Catbox.moe)
- **Supported Formats**: 
  - Images: JPG, PNG, GIF, WEBP, BMP, SVG
  - Videos: MP4, WEBM, MOV, AVI, MKV, WMV, FLV, 3GP

## Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
The app is a standard Next.js application and can be deployed anywhere that supports Node.js.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue in the repository.