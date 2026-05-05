export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-3 text-sm text-[#475569] lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Endpoints</p>
          <ul className="space-y-2">
            <li className="font-medium text-indigo-600">POST /api/scrape-serp</li>
            <li>POST /api/classify-pages</li>
            <li>POST /api/analyze-intent</li>
            <li>POST /api/recommend-angles</li>
            <li>POST /api/select-angle</li>
            <li>POST /api/generate-blog</li>
          </ul>
        </aside>

        <div className="space-y-10">
          <div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A]">API Reference</h1>
            <p className="text-lg text-[#475569]">
              Internal HTTP routes power the UI today—treat these as operational hooks while we finalize public keys.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Authentication</h2>
            <p className="text-[#475569]">
              Requests inherit your deployment origin. Add signed headers when moving beyond localhost.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Example · scrape SERP</h2>
            <pre className="overflow-x-auto rounded-2xl bg-gray-900 p-6 text-sm leading-relaxed text-green-400">
{`POST /api/scrape-serp
Content-Type: application/json

{
  "keyword": "best trail runners",
  "location": "United States",
  "contentType": "blog"
}`}
            </pre>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Responses</h2>
            <pre className="overflow-x-auto rounded-2xl bg-gray-900 p-6 text-sm leading-relaxed text-green-400">
{`200 OK
{
  "projectId": "uuid",
  "keyword": "best trail runners",
  "location": "United States",
  "totalResults": 30,
  "successfulScrapes": 27
}`}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
