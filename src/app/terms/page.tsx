export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
      <p className="text-slate-400 text-sm mb-10">Last updated: July 2025</p>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. About this platform</h2>
          <p>Marcos CRM is an internal music marketing management platform operated by Quompas Marketing. It is used exclusively by authorised agency staff to manage artist campaigns, track promotional activities, and monitor advertising performance.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Access</h2>
          <p>Access to Marcos CRM is by invitation only. Unauthorised use is strictly prohibited. Users must keep their login credentials confidential and are responsible for all activity under their account.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Permitted use</h2>
          <p>This platform may only be used for internal marketing management purposes on behalf of Quompas Marketing and its clients. Users may not share access, scrape data, or use the platform for any unlawful purpose.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Third-party integrations</h2>
          <p>Marcos CRM integrates with third-party services including TikTok Business API and Supabase. Use of these integrations is subject to the respective terms of those services. We access TikTok data in read-only mode solely for internal reporting purposes.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">5. Intellectual property</h2>
          <p>All content, code, and designs within Marcos CRM are owned by Quompas Marketing. Unauthorised reproduction or distribution is not permitted.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">6. Limitation of liability</h2>
          <p>Marcos CRM is provided as-is for internal use. Quompas Marketing is not liable for any loss of data, business interruption, or indirect damages arising from use of this platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">7. Changes</h2>
          <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">8. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:maxim@quompasmarketing.nl" className="text-blue-600 hover:underline">maxim@quompasmarketing.nl</a>.</p>
        </section>

      </div>
    </div>
  )
}
