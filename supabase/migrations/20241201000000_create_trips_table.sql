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