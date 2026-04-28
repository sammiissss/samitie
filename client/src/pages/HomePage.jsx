import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-churchBlue via-blue-800 to-blue-950 px-6 py-16 text-white shadow-xl md:px-10">
        <p className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-churchGold">
          Welcome Home
        </p>
        <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
          Fares Evangelical Belivers International Church
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          'Sunday Worship: 16:00 - 18:00',
          'Wednesday Prayer: 17:00 - 19:30',
          'Deliverance and Healing: 10:00 - 15:00',
        ].map((service) => (
          <div
            key={service}
            className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="font-semibold text-churchBlue">{service}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-churchBlue">Welcome</h2>
        <p className="mt-3 leading-8 text-slate-700">
          We are a community of believers passionate about worship, Word of God, and living a transformed life through Christ. Whether you are visiting for the first time or looking for a place to grow spiritually, you are warmly welcome here. Come and experience God's presence, find hope, and become part of a loving church family.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-slate-700">
          Experience the presence of God in a warm and welcoming environment. Join us for inspiring worship and meaningful fellowship.
        </p>
        <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-slate-200 shadow-md">
          <img
            src="/images/istockphoto-1148622732-612x612.jpg"
            alt="Church worship"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-churchBlue">Upcoming Events</h2>
          <Link to="/events" className="font-semibold text-churchGold hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3 text-slate-700">
          <li className="rounded-lg bg-slate-50 px-4 py-3">Youth Worship Night - May 10, 6:00 PM</li>
          <li className="rounded-lg bg-slate-50 px-4 py-3">Community Outreach - May 18, 10:00 AM</li>
          <li className="rounded-lg bg-slate-50 px-4 py-3">Women Prayer Breakfast - May 25, 8:00 AM</li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage
