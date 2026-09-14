import { useEffect, useMemo, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  Bell,
  BellRing,
  Cake,
  CalendarDays,
  Check,
  Moon,
  Quote,
  RotateCcw,
  Share2,
  Sparkles,
  Sun,
  Target,
  Cross,
  Gem,
  Star,
  Download,
  Plus,
  Trash2,
  Heart
} from 'lucide-react';

type Age = { years: number; months: number; days: number };
type SavedBirthday = { id: string; name: string; date: string };
type Favorite = { id: string; category: string; text: string };
type ContentKey =
  | 'birthday'
  | 'month'
  | 'year'
  | 'morning'
  | 'evening'
  | 'success'
  | 'motivation';

const quotes = [
  'Small steps every day become remarkable progress.',
  'Your future is built by what you do today.',
  'Keep going. You are closer than you think.',
  'Discipline turns dreams into plans and plans into results.',
  'You do not need to be perfect; you need to keep moving.',
  'Believe in the progress you cannot see yet.',
  'Your consistency today creates your confidence tomorrow.',
  'Protect your peace and keep your purpose in sight.',
  'Every new day is another chance to begin well.',
  'Let your actions speak louder than your doubts.',
  'Great things grow from small decisions made consistently.',
  'Be patient with yourself while you build the life you want.'
];

const prayers = {
  morning: [
    'May this morning bring peace to your heart, strength to your body, wisdom to your decisions, and favor to your path. Amen.',
    'May today open doors of opportunity and fill your heart with hope and gratitude. Amen.',
    'May God guide your steps today, protect you from harm, and give you wisdom for every decision. Amen.',
    'May your mind be calm, your heart be joyful, and your day be filled with grace and good opportunities. Amen.',
    'May you receive strength for every challenge and courage for every opportunity placed before you today. Amen.',
    'May your family be protected, your work be blessed, and your heart remain thankful throughout this day. Amen.',
    'May divine favor go before you and make a way where you see no way. Amen.',
    'May today bring you peace beyond worry, hope beyond fear, and blessings beyond expectation. Amen.'
  ],
  evening: [
    'Thank You for today. May your night be peaceful, your rest refreshing, and tomorrow full of new possibilities. Amen.',
    'As this day ends, give my heart peace, forgive my mistakes, and prepare me for a better tomorrow. Amen.',
    'May every worry I carry tonight be replaced with peace, and may I wake renewed and strengthened. Amen.',
    'Thank You for the lessons of today. Grant me restful sleep and wisdom for the opportunities of tomorrow. Amen.',
    'May my home be filled with peace tonight, and may everyone I love be kept safe and well. Amen.',
    'I release today into Your hands. Let my heart rest without fear and rise tomorrow with hope. Amen.',
    'May tonight bring quietness to my mind, healing to my body, and gratitude to my heart. Amen.',
    'Thank You for every blessing, seen and unseen. May tomorrow bring fresh mercy and new strength. Amen.'
  ],
  success: [
    'May your efforts be fruitful, your plans be guided by wisdom, and your work receive favor and success. Amen.',
    'May the work of your hands prosper, and may every honest effort produce meaningful results. Amen.',
    'May doors of opportunity open for you, and may you recognize and use them with wisdom. Amen.',
    'May you have clarity to make good decisions and courage to pursue the opportunities meant for you. Amen.',
    'May your goals become achievable steps, your steps become progress, and your progress become success. Amen.',
    'May your dedication be rewarded, your talents grow, and your work create value for others. Amen.',
    'May you overcome every obstacle with wisdom, patience, and strength, and finish what you started. Amen.',
    'May success come with peace, integrity, gratitude, and the wisdom to use every blessing well. Amen.'
  ]
};

const wishes = {
  birthday: [
    'Happy Birthday! May your new age bring you greater joy, good health, favor, and beautiful memories. 🎂',
    'May this birthday mark the beginning of an amazing chapter filled with answered prayers and success. ✨',
    'Happy Birthday! May your new age be filled with open doors, genuine happiness, and people who celebrate your journey. 🎈',
    'Wishing you a beautiful birthday and a year filled with peace, progress, prosperity, and unforgettable moments. 💚',
    'May your birthday bring fresh hope, renewed strength, and many reasons to be grateful. May your dreams move closer to reality. 🌟',
    'Cheers to another year of life! May wisdom guide you, favor follow you, and joy remain in your heart. 🥳',
    'On your special day, may you receive love, laughter, good health, and blessings that money cannot buy. 🎁',
    'May this new chapter be kinder, brighter, and more successful than the last. Happy Birthday and many happy returns! 🎂'
  ],
  month: [
    'Happy New Month! May this month bring fresh opportunities, peace, progress, and unexpected blessings. 🌿',
    'Welcome to a new month! May every day bring you closer to your goals and fill your life with good news. ✨',
    'Happy New Month! May your efforts be rewarded, your plans succeed, and your home be filled with peace. 💚',
    'May this new month bring divine favor, renewed strength, good health, and beautiful opportunities your way. 🙏',
    'A fresh month is a fresh beginning. May you leave behind what held you back and move forward with confidence. 🌱',
    'May this month be filled with answered prayers, productive days, meaningful connections, and reasons to smile. 😊',
    'Happy New Month! May doors open for you, may your work prosper, and may your heart remain hopeful. 🌟',
    'May the month ahead bring you closer to the life you desire, with wisdom for every choice and grace for every step. 🤍'
  ],
  year: [
    'Happy New Year! May the year ahead be filled with growth, purpose, prosperity, peace, and countless reasons to smile. 🎉',
    'Welcome to a new year! May you experience new opportunities, stronger relationships, good health, and remarkable progress. ✨',
    'May this year bring you courage to start, discipline to continue, and wisdom to know what truly matters. 🌟',
    'Happy New Year! May your home know peace, your work know progress, and your heart know lasting joy. 💚',
    'May the new year turn your hopes into plans, your plans into action, and your action into beautiful results. 🚀',
    'Wishing you twelve months of growth, meaningful memories, good health, and abundant reasons to be thankful. 🥂',
    'May this year be a chapter of answered prayers, open doors, personal growth, and greater happiness. 🙏',
    'Happy New Year! May you become stronger, wiser, healthier, and closer to your dreams with every passing month. 🎊'
  ]
};

const zodiacFacts: Record<string, [string, string, string]> = {
  Aquarius: ['January 20 – February 18', 'Amethyst', 'Violet'],
  Pisces: ['February 19 – March 20', 'Aquamarine', 'Sea Green'],
  Aries: ['March 21 – April 19', 'Diamond', 'Red'],
  Taurus: ['April 20 – May 20', 'Emerald', 'Green'],
  Gemini: ['May 21 – June 20', 'Pearl', 'Yellow'],
  Cancer: ['June 21 – July 22', 'Ruby', 'Silver'],
  Leo: ['July 23 – August 22', 'Peridot', 'Gold'],
  Virgo: ['August 23 – September 22', 'Sapphire', 'Navy Blue'],
  Libra: ['September 23 – October 22', 'Opal', 'Pink'],
  Scorpio: ['October 23 – November 21', 'Topaz', 'Deep Red'],
  Sagittarius: ['November 22 – December 21', 'Turquoise', 'Purple'],
  Capricorn: ['December 22 – January 19', 'Garnet', 'Charcoal']
};

function dateValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function annualBirthday(year: number, month: number, day: number) {
  return new Date(year, month, Math.min(day, daysInMonth(year, month)));
}

function calculateAge(b: Date, t: Date): Age {
  if (t < b) return { years: 0, months: 0, days: 0 };

  let years = t.getFullYear() - b.getFullYear();

  const birthdayThisYear = annualBirthday(
    t.getFullYear(),
    b.getMonth(),
    b.getDate()
  );

  if (t < birthdayThisYear) years--;

  years = Math.max(0, years);

  const anchor = annualBirthday(
    b.getFullYear() + years,
    b.getMonth(),
    b.getDate()
  );

  let months =
    (t.getFullYear() - anchor.getFullYear()) * 12 +
    (t.getMonth() - anchor.getMonth());

  if (t.getDate() < anchor.getDate()) months--;

  months = Math.max(0, months);

  const monthAnchor = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + months,
    Math.min(
      anchor.getDate(),
      daysInMonth(anchor.getFullYear(), anchor.getMonth() + months)
    )
  );

  const days = Math.floor(
    (t.getTime() - monthAnchor.getTime()) / 86400000
  );

  return {
    years,
    months,
    days: Math.max(0, days)
  };
}

function nextBirthday(b: Date, n: Date) {
  let x = annualBirthday(n.getFullYear(), b.getMonth(), b.getDate());

  if (x < n) {
    x = annualBirthday(
      n.getFullYear() + 1,
      b.getMonth(),
      b.getDate()
    );
  }

  return x;
}

function zodiacFor(b: Date) {
  const md = (b.getMonth() + 1) * 100 + b.getDate();

  if (md >= 120 && md <= 218) return 'Aquarius';
  if (md <= 320) return 'Pisces';
  if (md <= 419) return 'Aries';
  if (md <= 520) return 'Taurus';
  if (md <= 620) return 'Gemini';
  if (md <= 722) return 'Cancer';
  if (md <= 822) return 'Leo';
  if (md <= 922) return 'Virgo';
  if (md <= 1022) return 'Libra';
  if (md <= 1121) return 'Scorpio';
  if (md <= 1221) return 'Sagittarius';

  return 'Capricorn';
}

function daysUntil(date: string) {
  const [, month, day] = date.split('-').map(Number);

  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let next = annualBirthday(
    start.getFullYear(),
    month - 1,
    day
  );

  if (next < start) {
    next = annualBirthday(
      start.getFullYear() + 1,
      month - 1,
      day
    );
  }

  return Math.round(
    (next.getTime() - start.getTime()) / 86400000
  );
}

function notificationId(seed: string) {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return Math.max(1, hash % 2000000000);
}

export default function App() {
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [today, setToday] = useState(dateValue(new Date()));

  const [dark, setDark] = useState(
    () => localStorage.getItem('agejoy_dark') === 'true'
  );

  const [tab, setTab] = useState<
    'age' | 'wishes' | 'prayers' | 'motivation' | 'cards'
  >('age');

  const [wishType, setWishType] = useState<
    'birthday' | 'month' | 'year'
  >('birthday');

  const [wishIndex, setWishIndex] = useState(0);

  const [prayerType, setPrayerType] = useState<
    'morning' | 'evening' | 'success'
  >('morning');

  const [prayerIndex, setPrayerIndex] = useState(0);

  const [quoteIndex, setQuoteIndex] = useState(
    new Date().getDate() % quotes.length
  );

  const [copied, setCopied] = useState(false);

  const [saved, setSaved] = useState<SavedBirthday[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('agejoy_birthdays') || '[]'
      );
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('agejoy_favorites') || '[]'
      );
    } catch {
      return [];
    }
  });

  const [person, setPerson] = useState('');
  const [personDate, setPersonDate] = useState('');

  const [cardName, setCardName] = useState('Dear Friend');

  const [cardMessage, setCardMessage] = useState(
    'Happy Birthday! Wishing you joy, good health, success and beautiful memories in your new age.'
  );

  const [notify, setNotify] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('agejoy_dark', String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem(
      'agejoy_birthdays',
      JSON.stringify(saved)
    );
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(
      'agejoy_favorites',
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    LocalNotifications.checkPermissions()
      .then(result => {
        setNotify(result.display === 'granted');
      })
      .catch(() => {
        if (typeof Notification !== 'undefined') {
          setNotify(Notification.permission === 'granted');
        }
      });
  }, []);

  const birth = useMemo(
    () => parseDate(birthDate),
    [birthDate]
  );

  const current = useMemo(
    () => parseDate(today),
    [today]
  );

  const invalidBirth =
    Number.isNaN(birth.getTime()) ||
    Number.isNaN(current.getTime()) ||
    birth > current;

  const age = useMemo(
    () => calculateAge(birth, current),
    [birth, current]
  );

  const next = useMemo(
    () => nextBirthday(birth, current),
    [birth, current]
  );

  const days = invalidBirth
    ? 0
    : Math.max(
        0,
        Math.round(
          (next.getTime() - current.getTime()) / 86400000
        )
      );

  const zodiac = zodiacFor(birth);
  const facts = zodiacFacts[zodiac];

  const livedDays = invalidBirth
    ? 0
    : Math.floor(
        (current.getTime() - birth.getTime()) / 86400000
      );

  const milestones = [1000, 5000, 10000, 15000, 20000]
    .map(x => ({
      days: x,
      left: Math.max(0, x - livedDays)
    }))
    .filter(x => x.left > 0)
    .slice(0, 3);

  const activeText =
    tab === 'motivation'
      ? quotes[quoteIndex]
      : tab === 'prayers'
      ? prayers[prayerType][prayerIndex]
      : wishes[wishType][wishIndex];

  const activeCategory: ContentKey =
    tab === 'motivation'
      ? 'motivation'
      : tab === 'prayers'
      ? prayerType
      : wishType;

  const isFavorite = favorites.some(
    f => f.text === activeText
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1200
      );
    } catch {
      setNotice(
        'Copy is unavailable on this device. You can select the text manually.'
      );
    }
  };

  const share = async () => {
    try {
      await Share.share({
        title: 'AgeJoy',
        text: activeText,
        dialogTitle: 'Share from AgeJoy'
      });
    } catch {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'AgeJoy',
            text: activeText
          });
        } else {
          await copy();
        }
      } catch {
        // User cancelled sharing.
      }
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites(v =>
        v.filter(f => f.text !== activeText)
      );
    } else {
      setFavorites(v => [
        ...v,
        {
          id: `${Date.now()}`,
          category: activeCategory,
          text: activeText
        }
      ]);
    }
  };

  const scheduleBirthdayNotifications = async (
    birthdays: SavedBirthday[],
    requestPermission = false
  ) => {
    const permission = requestPermission
      ? await LocalNotifications.requestPermissions()
      : await LocalNotifications.checkPermissions();

    if (permission.display !== 'granted') {
      return false;
    }

    await LocalNotifications.createChannel({
      id: 'agejoy-birthdays',
      name: 'Birthday reminders',
      description: 'Birthday reminders from AgeJoy',
      importance: 4,
      vibration: true,
      lights: true
    });

    const now = new Date();

    const yearsToClear = Array.from(
      { length: 16 },
      (_, i) => now.getFullYear() - 5 + i
    );

    const idsToClear = birthdays.flatMap(x =>
      yearsToClear.map(year =>
        notificationId(`${x.id}-${year}`)
      )
    );

    if (idsToClear.length) {
      await LocalNotifications.cancel({
        notifications: idsToClear.map(id => ({ id }))
      });
    }

    const notifications = birthdays.flatMap(x => {
      const [, m, d] = x.date
        .split('-')
        .map(Number);

      return [0, 1, 2, 3, 4]
        .map(offset => {
          const year =
            now.getFullYear() + offset;

          const at = annualBirthday(
            year,
            m - 1,
            d
          );

          at.setHours(9, 0, 0, 0);

          if (at <= now) {
            return null;
          }

          return {
            id: notificationId(
              `${x.id}-${year}`
            ),
            title: `🎂 ${x.name}'s birthday`,
            body:
              offset === 0
                ? 'Today is the day! Celebrate them with AgeJoy.'
                : `Save the date — ${x.name}'s birthday is coming up.`,
            schedule: {
              at,
              isExactNotification: false
            },
            channelId: 'agejoy-birthdays'
          };
        })
        .filter(Boolean);
    });

    if (notifications.length) {
      await LocalNotifications.schedule({
        notifications: notifications as any
      });
    }

    return true;
  };

  const scheduleNotifications = async () => {
    try {
      const granted =
        await scheduleBirthdayNotifications(
          saved,
          true
        );

      if (!granted) {
        setNotify(false);

        setNotice(
          'Notifications were not allowed. You can enable them later in Android Settings.'
        );

        return;
      }

      setNotify(true);

      setNotice(
        saved.length
          ? 'Birthday notifications are enabled. Reminders are scheduled for the next 5 years.'
          : 'Notifications are enabled. Add birthdays to schedule reminders.'
      );
    } catch {
      if (typeof Notification !== 'undefined') {
        const permission =
          await Notification.requestPermission();

        setNotify(permission === 'granted');

        if (permission === 'granted') {
          new Notification(
            'AgeJoy is ready!',
            {
              body:
                'You can use AgeJoy reminders and inspiration.'
            }
          );
        }
      } else {
        setNotice(
          'Notifications are not available on this device.'
        );
      }
    }
  };

  const requestNotifications = () =>
    void scheduleNotifications();

  const addBirthday = () => {
    if (!person.trim() || !personDate) {
      return;
    }

    const newBirthday: SavedBirthday = {
      id: `${Date.now()}`,
      name: person.trim(),
      date: personDate
    };

    const nextSaved = [
      ...saved,
      newBirthday
    ];

    setSaved(nextSaved);
    setPerson('');
    setPersonDate('');

    if (notify) {
      void scheduleBirthdayNotifications(
        nextSaved
      ).catch(() => undefined);
    }

    setNotice(
      notify
        ? 'Birthday saved and its reminder was scheduled.'
        : 'Birthday saved. Tap Enable notifications to schedule its reminder.'
    );
  };

  const deleteBirthday = async (id: string) => {
    const nextSaved = saved.filter(
      x => x.id !== id
    );

    setSaved(nextSaved);

    if (notify) {
      try {
        const now = new Date();

        const ids = Array.from(
          { length: 16 },
          (_, i) =>
            now.getFullYear() - 5 + i
        ).map(year =>
          notificationId(`${id}-${year}`)
        );

        awai
