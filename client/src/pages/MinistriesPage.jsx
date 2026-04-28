const ministries = [
  {
    title: 'Youth Ministry',
    description: 'Helping youth grow in Christ through Bible teaching, worship, and fellowship.',
    time: 'Saturdays, 4:00 PM',
  },
  {
    title: "Women's Ministry",
    description: 'Encouraging women through prayer, support, and practical discipleship.',
    time: 'Thursdays, 5:00 PM',
  },
  {
    title: 'Choir',
    description: 'Leading the congregation in worship with excellence and devotion.',
    time: 'Fridays, 6:00 PM',
  },
  {
    title: 'Bible Study',
    description: 'In-depth study of Scripture for spiritual growth and daily life application.',
    time: 'Wednesdays, 6:30 PM',
  },
]

function MinistriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-yellow-50 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-churchBlue md:text-4xl">Ministries</h1>
        <p className="mt-2 text-slate-700">Find a place to serve, grow, and connect.</p>
      </section>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ministries.map((ministry) => (
          <article
            key={ministry.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-churchBlue">{ministry.title}</h2>
            <p className="mt-2 leading-7 text-slate-700">{ministry.description}</p>
            <p className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-churchGold">
              {ministry.time}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default MinistriesPage
