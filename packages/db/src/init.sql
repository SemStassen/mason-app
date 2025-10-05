-- Create the custom setting for workspace isolation
-- This must be run before the application starts

-- Create the custom setting if it doesn't exist
DO $$
BEGIN
    -- Check if the setting exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_settings 
        WHERE name = 'app.current_workspace_id'
    ) THEN
        -- Create the custom setting
        PERFORM set_config('app.current_workspace_id', '', false);
    END IF;
END $$;

-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the uuid_generate_v7 function if it doesn't exist
-- This is needed for the tableId snippet
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$;

