# Trips Management Setup

This document explains how to set up the trips management functionality with image upload capabilities.

## Database Setup

### 1. Create the Trips Table

Run the following SQL migration in your Supabase SQL editor:

```sql
-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration TEXT,
    max_people INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    image TEXT DEFAULT '/placeholder.svg',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policies for trips table
-- Allow all authenticated users to read trips
CREATE POLICY "Allow authenticated users to read trips" ON public.trips
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert trips
CREATE POLICY "Allow authenticated users to insert trips" ON public.trips
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update trips
CREATE POLICY "Allow authenticated users to update trips" ON public.trips
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete trips
CREATE POLICY "Allow authenticated users to delete trips" ON public.trips
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_trips_updated_at
    BEFORE UPDATE ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

### 2. Storage Bucket Setup

Make sure you have a storage bucket named `gallery` in your Supabase project. The trips images will be stored in a subfolder called `trips/` within this bucket.

## Features

### Image Upload Functionality

The trips management now includes:

1. **File Selection**: Admins can select image files (JPG, PNG, etc.) for each trip
2. **Image Preview**: Selected images are displayed in a preview before saving
3. **Upload Progress**: Visual feedback during image upload
4. **Image Storage**: Images are uploaded to Supabase storage in the `gallery/trips/{user_id}/` folder
5. **Image Display**: Trip images are displayed in the trips list and edit forms

### Admin Interface

- **Add New Trip**: Click "Add New Trip" to create a new trip with image upload
- **Edit Trip**: Click the edit button to modify existing trips and their images
- **Delete Trip**: Click the delete button to remove trips (with confirmation dialog)
- **Image Management**: 
  - Select new images for trips
  - Preview images before saving
  - Remove selected images before saving
  - See file size and name information

### Database Integration

- Trips are stored in the `trips` table with all necessary fields
- Images are stored in Supabase storage with public URLs
- Row Level Security ensures only authenticated users can manage trips
- Automatic timestamps for created_at and updated_at fields

## Usage

1. Navigate to the Admin Dashboard
2. Go to the "Trips" tab
3. Click "Add New Trip" to create a new trip
4. Fill in the trip details and select an image
5. Click "Save Trip" to upload the image and save the trip
6. Use the edit and delete buttons to manage existing trips

## Error Handling

The system includes fallback mechanisms:
- If the trips table doesn't exist, it falls back to local state
- If image upload fails, the trip is saved with a placeholder image
- Error messages are displayed to the user for any failures
- Loading states prevent multiple submissions during uploads 