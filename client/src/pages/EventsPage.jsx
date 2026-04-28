const events = [
  {
    title: 'Gospel Conference',
    date: 'May 7, 2026',
    time: '17:00',
    description: 'A Gospel Conference featuring powerful preaching, heartfelt worship, and a focused time of deliverance and healing.',
  },
  {
    title: 'Community Outreach',
    date: 'May 18, 2026',
    time: '10:00',
    description: 'Sharing the love and Gospel of Christ with in the community.',
  },
  {
    title: 'Women Prayer Breakfast',
    date: 'May 25, 2026',
    time: '8:00 AM',
    description: 'A morning gathering for encouragement, prayer, and connection.',
  },
]

function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-yellow-50 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-churchBlue md:text-4xl">Upcoming Events</h1>
        <p className="mt-2 text-slate-700">Join us in worship, fellowship, and outreach activities.</p>
      </section>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article
            key={event.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-churchBlue">{event.title}</h2>
            <p className="mt-1 text-sm font-semibold text-churchGold">
              {event.date} - {event.time}
            </p>
            <p className="mt-3 leading-7 text-slate-700">{event.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default EventsPage
