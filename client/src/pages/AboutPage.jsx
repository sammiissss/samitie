function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-yellow-50 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-churchBlue md:text-4xl">About Our Church</h1>
        <p className="mt-2 text-slate-700">A faith family serving Addis Ababa with the Gospel.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-churchBlue">Church History</h2>
        <p className="mt-3 leading-8 text-slate-700">
          Fares Evangelical Believers International Church began in 2003 as a small and humble Bible study group, where a few believers gathered with a shared passion for the Word of God, prayer, and spiritual growth. As the number of believers continued to grow, the church was officially established in 2004 in Megenagna, Addis Ababa. From those early beginnings, the church has experienced steady growth both spiritually and in number, becoming a vibrant and active community of faith that continues to transform lives through the Gospel.
        </p>
        <p className="mt-3 leading-8 text-slate-700">
          Today, the church has grown to around 300 Christian members, supported by approximately 50 devoted servants who faithfully serve in various ministries. The church is enriched by multiple groups and ministries, including the choir, discipleship groups, Bible study fellowships, sisterhood ministry, Tsion children's team, youth groups, and a committed prayer team. In addition, the church actively engages in outreach programs such as the "Yefeker" servant ministry, which focuses on supporting the poor and those in need, and is deeply committed to evangelism, working to spread the message of Jesus Christ to the wider community and beyond.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-churchBlue">Mission</h2>
          <p className="mt-3 text-slate-700">
            Revealing the glory of God on our earth and spreading the Gospel to the whole world.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-churchBlue">Vision</h2>
          <p className="mt-3 text-slate-700">
            Our vision is to build a Christ-centered church that raises believers who are transformed by the Holy Spirit, rooted in faith, and committed to discipleship—growing into a holy, loving, and fruitful people who reflect God's character in their lives and impact the world around them.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-churchBlue">Beliefs</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>We believe in one God: Father, Son, and Holy Spirit.</li>
          <li>We believe the Bible is the inspired Word of God.</li>
          <li>We believe salvation is by grace through faith in Jesus Christ.</li>
          <li>We believe in the power of prayer and the work of the Holy Spirit.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-churchBlue">Pastor</h2>
        <div className="mt-4 grid items-center gap-6 md:grid-cols-[180px_1fr]">
          <img
            src="/images/photo_6016811993139973134_y.jpg"
            alt="Pastor Firew Zeneb"
            className="h-44 w-44 rounded-xl border-4 border-blue-50 object-cover object-top shadow-md"
          />
          <div>
            <h3 className="text-xl font-semibold text-churchGold">Pastor Firew Zeneb</h3>
            <p className="mt-2 text-slate-700">
              Pastor Firew Zeneb has served the church with dedication and passion,
              leading the congregation with strong biblical teaching and a heart for discipleship.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
