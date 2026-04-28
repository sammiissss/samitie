import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const translations = {
    en: {
      home: 'Home',
      about: 'About',
      sermons: 'Sermons',
      events: 'Events',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      welcomeHome: 'Welcome Home',
      churchName: 'Fares Evangelical Belivers International Church',
      sundayWorship: 'Sunday Worship: 16:00 - 18:00',
      wednesdayPrayer: 'Wednesday Prayer: 17:00 - 19:30',
      deliveranceHealing: 'Deliverance and Healing: 10:00 - 15:00',
      welcome: 'Welcome',
      churchHistory: 'Church History',
      mission: 'Mission',
      vision: 'Vision',
      beliefs: 'Beliefs',
      pastor: 'Pastor',
      latestSermon: 'Latest Sermon',
      upcomingEvents: 'Upcoming Events',
      youthWorshipNight: 'Youth Worship Night - May 10, 6:00 PM',
      communityOutreach: 'Community Outreach - May 18, 10:00 AM',
      womenPrayerBreakfast: 'Women Prayer Breakfast - May 25, 8:00 AM',
      viewAll: 'View all'
    },
    am: {
      home: 'ቤት',
      about: 'ስለ እኛ',
      sermons: 'የሰኞች ትምህርት',
      events: 'ዝግጅቶች',
      contact: 'ይወዙን',
      login: 'ይግቡ',
      register: 'ይመዝገቡ',
      logout: 'ውጣ',
      welcomeHome: 'እንኳን ደህና መጡ',
      churchName: 'ፋሬስ ኢቫንጄሊካል ቤልየርስ ኢንተርናሽናል ቤተ ክርስቲያን',
      sundayWorship: 'እሑድ የሰኞች አምልጎ 16:00 - 18:00',
      wednesdayPrayer: 'ረቡዕ ጸሎት 17:00 - 19:30',
      deliveranceHealing: 'ነፍጸናማነት እና ማከም 10:00 - 15:00',
      welcome: 'እንኳን ደህና መጡ',
      churchHistory: 'የቤተ ክርስቲያን ታሪክ',
      mission: 'ዓርቃ',
      vision: 'ራዕይ',
      beliefs: 'እምነታችን',
      pastor: 'ጳስተር',
      latestSermon: 'የቅርንጫፍ ትምህርት',
      upcomingEvents: 'የሚመጣው ዝግጅቶች',
      youthWorshipNight: 'የወጣቶች አምልጎ - ሜይ 10, 6:00 ሰዓት',
      communityOutreach: 'የማህበረሰብ አገልግሎት - ሜይ 18, 10:00 ጠዋት',
      womenPrayerBreakfast: 'የሴቶች ጸሎት እና ቁርስና - ሜይ 25, 8:00 ጠዋት',
      viewAll: 'ሁሉንም ይመልከቱ'
    }
  }

  const t = (key) => translations[language][key] || key

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider
