# Setup Instructions for Gemini API Key

## Important: Required Configuration

The system is fully deployed, but you need to configure the Gemini API key for the edge function to work.

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Adding the API Key to Supabase

The Gemini API key must be stored as an environment variable in your Supabase project:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/ejxlpycwxckveejgjmjv
2. Navigate to **Settings** → **Edge Functions**
3. Scroll to **Environment Variables**
4. Click **Add Variable**
5. Set:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key (e.g., `AIzaSy...`)
6. Click **Save**

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase secrets set GEMINI_API_KEY=your_api_key_here
```

## Verifying the Setup

After adding the API key:

1. Open the application at `http://localhost:3000` (or your deployed URL)
2. Click "Start Study"
3. On Task 1, enter a test prompt
4. Click "Submit Prompt"
5. You should receive a response from Gemini

If you see an error like "Gemini API key not configured", double-check that:
- The environment variable is named exactly `GEMINI_API_KEY`
- The API key is valid and active
- You've saved the changes in Supabase

## Testing the Edge Function

You can test the edge function directly:

```bash
curl -X POST \
  https://ejxlpycwxckveejgjmjv.supabase.co/functions/v1/generate-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "userID": "test-user-id",
    "taskID": 1,
    "prompt": "Hello, test prompt",
    "conversationHistory": []
  }'
```

A successful response will look like:
```json
{
  "success": true,
  "response": "Gemini's response text here",
  "turnNumber": 1
}
```

## Troubleshooting

### Error: "Gemini API key not configured"
- The `GEMINI_API_KEY` environment variable is not set
- Add it via Supabase dashboard as described above

### Error: "Failed to get response from Gemini API"
- Your API key may be invalid or expired
- Check the API key in Google AI Studio
- Verify the key has no extra spaces

### Error: "Failed to store prompt"
- Database connection issue
- Check Supabase project is active
- Verify RLS policies are correctly set

## Security Notes

- The API key is stored securely in Supabase and never exposed to the frontend
- All API calls to Gemini go through the edge function
- Users never have direct access to the API key
- The edge function runs on Supabase's secure infrastructure

## Rate Limits

Google Gemini API has rate limits:
- Free tier: 60 requests per minute
- Adjust your usage accordingly for research purposes
- Consider upgrading if you expect high traffic

## Ready to Use

Once the `GEMINI_API_KEY` is configured, the system is fully operational and ready for research data collection.
