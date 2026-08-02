export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-slate-400 text-sm mb-10">Last updated: July 2025</p>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Who we are</h2>
          <p>Marcos CRM is operated by Quompas Marketing, based in the Netherlands. We can be reached at <a href="mailto:maxim@quompasmarketing.nl" className="text-blue-600 hover:underline">maxim@quompasmarketing.nl</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. What data we collect</h2>
          <p>Marcos CRM is an internal platform accessible only to authorised staff. We collect and process the following data:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Account login data (email address, hashed password) via Supabase Auth</li>
            <li>Artist and campaign data entered by users</li>
            <li>TikTok advertising metrics retrieved via the TikTok Business API (read-only)</li>
            <li>Usage logs for security and debugging purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. TikTok data</h2>
          <p>We integrate with the TikTok Business API to retrieve advertising performance data including campaign metrics, reach, impressions, video views, engagement, and audience breakdowns. This data is:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Accessed in read-only mode — we do not create or modify TikTok ads</li>
            <li>Stored securely in our Supabase database</li>
            <li>Used exclusively for internal reporting and campaign management</li>
            <li>Never sold or shared with third parties</li>
            <li>Access tokens are stored server-side only and never exposed to the browser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. How we use data</h2>
          <p>All data is used exclusively for internal marketing management purposes: monitoring campaign performance, coordinating promotional activities, and generating reports for agency clients.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">5. Data storage and security</h2>
          <p>Data is stored in Supabase, hosted in the European Union. We apply row-level security so each user can only access their own data. All connections are encrypted via HTTPS/TLS.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">6. Data retention</h2>
          <p>We retain data for as long as necessary for operational purposes. Users may request deletion of their account and associated data by contacting us.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">7. Third-party services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Vercel</strong> — hosting and deployment</li>
            <li><strong>TikTok Business API</strong> — advertising data</li>
            <li><strong>Anthropic Claude</strong> — AI-generated insights (no personal data is sent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">8. Your rights</h2>
          <p>Under GDPR, you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:maxim@quompasmarketing.nl" className="text-blue-600 hover:underline">maxim@quompasmarketing.nl</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">9. Changes</h2>
          <p>We may update this privacy policy from time to time. The latest version is always available at this URL.</p>
        </section>

      </div>
    </div>
  )
}
