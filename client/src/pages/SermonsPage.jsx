const sermons = [
  { title: 'Living by Faith', date: 'April 14, 2026', videoId: '4m6ZsWX6UxM' },
  { title: 'Power of Prayer', date: 'April 7, 2026', videoId: 'sBws8MSXN7A' },
  { title: 'Hope in Christ', date: 'March 31, 2026', videoId: 'f7vQZ6F6B2Y' },
]

function SermonsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-yellow-50 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-churchBlue md:text-4xl">Sermons</h1>
        <p className="mt-2 text-slate-700">Listen to recent messages and grow in the Word.</p>
      </section>
      <div className="mt-6 grid gap-6">
        {sermons.map((sermon) => (
          <article
            key={sermon.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-churchBlue">{sermon.title}</h2>
            <p className="mb-3 mt-1 text-sm font-medium text-churchGold">{sermon.date}</p>
            <div className="aspect-video overflow-hidden rounded-lg border border-slate-200">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${sermon.videoId}`}
                title={sermon.title}
                allowFullScreen
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default SermonsPage
