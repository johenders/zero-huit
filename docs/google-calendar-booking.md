# Google Calendar booking setup

1. Apply `supabase/migrations/20260609_create_appointment_requests.sql`.
2. In Google Cloud, enable the Google Calendar API.
3. Create an OAuth 2.0 Web application.
4. Add this authorized redirect URI:

   `https://zerohuit.ca/api/admin/google-calendar/callback`

5. Configure the variables listed in `.env.example`.
6. Generate the token encryption key with:

   ```bash
   openssl rand -base64 32
   ```

7. Deploy the application.
8. Sign in to the site admin and open `/admin/rendez-vous`.
9. Select **Connecter Google**, then authorize with `lev@zerohuit.ca`.

The public calendar remains unavailable until the migration, environment
variables, and Google authorization are all complete.

## Availability rules

- Monday to Friday, from 9:00 AM to 4:00 PM (`America/Toronto`).
- 30-minute appointments with a minimum lead time of 3 hours.
- Lunch is unavailable from 12:00 PM to 1:00 PM.
- Existing calendar events include a 30-minute buffer before and after.
- Two to four additional time slots are hidden deterministically per day.
