-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Role to Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- 3. Enable RLS on Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Audit Log Policies
-- Allow users to create logs (e.g., "User logged in")
CREATE POLICY "Enable insert for authenticated users" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all logs
CREATE POLICY "Enable select for admins" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. Update Profiles Policies for Admin Access
-- Allow admins to update any profile (e.g., ban user, verify)
CREATE POLICY "Enable update for admins" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete any profile
CREATE POLICY "Enable delete for admins" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
