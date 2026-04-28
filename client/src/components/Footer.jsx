function Footer() {
  return (
    <footer className="mt-14 bg-gradient-to-r from-churchBlue via-blue-900 to-churchBlue text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-churchGold">
            Fares Evangelical Belivers International Church
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-100">
            Main Church: Meklit Building, Addis Ababa
            <br />
            Branch Church: Ferensay Gurara, Addis Ababa
          </p>
        </div>
        <div className="text-sm leading-7">
          <p>Phone: +251911430339</p>
          <p>Email: pastorfirewzeneb@gmail.com</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-churchGold">Contact Us</p>
          <div className="mt-2 flex gap-3">
            <a href="https://t.me/+251911430339" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-3 py-1 hover:text-churchGold">
              Telegram
            </a>
            <a href="https://wa.me/251911430339" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-3 py-1 hover:text-churchGold">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
