# Media Upload Fix Guide

## 🚨 Issue Fixed
Photos and videos now use **Supabase Storage** instead of inefficient base64 data URLs.

## ✅ Changes Made

### 1. Created Supabase Upload Utility
- `src/utils/supabase-upload.ts` - Handles file uploads to Supabase Storage
- Proper file validation (type, size)
- Unique filename generation
- Error handling

### 2. Updated ArticleEditor
- Cover image upload now uses Supabase Storage
- Gallery images upload to Supabase Storage
- Video uploads to Supabase Storage
- Better user feedback with success messages

### 3. File Validation
- **Images**: JPEG, PNG, WebP, GIF (max 5MB)
- **Videos**: MP4, WebM, OGG (max 100MB)

## 🔧 Setup Required

### Step 1: Create Storage Bucket
1. Go to your **Supabase Dashboard** → **Storage**
2. Click **"Create bucket"**
3. Name it: `media`
4. Set as **Public bucket** ✅
5. Click **Create**

### Step 2: Set Storage Policies
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `supabase-storage-setup.sql`
3. Click **"Run"**

This will:
- ✅ Create the `media` bucket
- ✅ Set up upload/download permissions
- ✅ Allow file management

### Step 3: Test Upload
1. Start your app: `npm run dev`
2. Go to Admin → Create Article
3. Try uploading a cover image
4. Should show: "Cover image uploaded successfully!"

## 📁 File Organization

Files are organized in Supabase Storage as:
```
media/
├── images/
│   ├── abc123.jpg
│   ├── def456.png
│   └── ...
└── videos/
    ├── xyz789.mp4
    ├── uvw012.webm
    └── ...
```

## 🔒 Security Notes

**Development Mode**: Anonymous uploads allowed
**Production**: Should require authentication

To secure for production, remove these policies:
```sql
DROP POLICY "Anonymous uploads allowed" ON storage.objects;
DROP POLICY "Anonymous updates allowed" ON storage.objects;
DROP POLICY "Anonymous deletes allowed" ON storage.objects;
```

## 🚀 Benefits

1. **Performance**: No more huge base64 strings in database
2. **Scalability**: Proper file storage with CDN
3. **Management**: Files can be managed through Supabase dashboard
4. **Validation**: Proper file type and size checks
5. **URLs**: Clean, cacheable URLs for images/videos

## 🔍 Troubleshooting

**"Bucket not found"**: Run the storage setup SQL
**"Upload failed"**: Check storage policies are set
**"Too large"**: File exceeds size limits
**"Invalid type"**: File format not supported

## ✨ After Setup

Your media uploads will now:
- ✅ Upload to Supabase Storage
- ✅ Generate public URLs
- ✅ Work efficiently
- ✅ Scale properly