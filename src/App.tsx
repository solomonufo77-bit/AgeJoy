import { useEffect, useMemo, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Bell, BellRing, Cake, CalendarDays, Check, Moon, Quote, RotateCcw, Share2, Sparkles, Sun, Target, Cross, Gem, Star, Download, Plus, Trash2, Heart } from 'lucide-react';

type Age = { years: number; months: number; days: number };
type SavedBirthday = { id: string; name: string; date: string };
type Favorite = { id: string; category: string; text: string };
type ContentKey = 'birthday' | 'month' | 'year' | 'morning' | 'evening' | 'success' | 'motivation';

const quotes = ['Small steps every day become remarkable progress.','Your future is built by what you do today.','Keep going. You are closer than you think.','Discipline turns dreams into plans and plans into results.','You do not need to be perfect; you need to keep moving.','Believe in the progress you cannot see yet.','Your consistency today creates your confidence tomorrow.','Protect your peace and keep your purpose in sight.','Every new day is another chance to begin well.','Let your actions speak louder than your doubts.','Great things grow from small decisions made consistently.','Be patient with yourself while you build the life you want.'];

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
  Aquarius: ['January 20 – February 18','Amethyst','Violet'],
  Pisces: ['February 19 – March 20','Aquamarine','Sea Green'],
  Aries: ['March 21 – April 19','Diamond','Red'],
  Taurus: ['April 20 – May 20','Emerald','Green'],
  Gemini: ['May 21 – June 20','Pearl','Yellow'],
  Cancer: ['June 21 – July 22','Ruby','Silver'],
  Leo: ['July 23 – August 22','Peridot','Gold'],
  Virgo: ['August 23 – September 22','Sapphire','Navy Blue'],
  Libra: ['September 23 – October 22','Opal','Pink'],
  Scorpio: ['October 23 – November 21','Topaz','Deep Red'],
  Sagittarius: ['November 22 – December 21','Turquoise','Purple'],
  Capricorn: ['December 22 – January 19','Garnet','Charcoal']
};

function dateValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  const birthdayThisYear = annualBirthday(t.getFullYear(), b.getMonth(), b.getDate());

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

  return { years, months, days: Math.max(0, days) };
}

function nextBirthday(b: Date, n: Date) {
  let x = annualBirthday(n.getFullYear(), b.getMonth(), b.getDate());

  if (x < n) {
    x = annualBirthday(n.getFullYear() + 1, b.getMonth(), b.getDate());
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
      .then(result =>
        setNotify(result.display === 'granted')
      )
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
      if (navigator.share) {
        await navigator.share({
          title: 'AgeJoy',
          text: activeText
        });
      } else {
        await copy();
      }
    } catch {
      /* user cancelled */
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
      const [, m, d] = x.date.split('-').map(Number);

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

        setNotify(
          permission === 'granted'
        );

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

  const deleteBirthday = async (
    id: string
  ) => {
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
          notificationId(
            `${id}-${year}`
          )
        );

        await LocalNotifications.cancel({
          notifications: ids.map(
            notificationIdValue => ({
              id: notificationIdValue
            })
          )
        });
      } catch {
        /* notification cleanup is best effort */
      }
    }
  };

  const downloadCard = () => {
    const canvas =
      document.createElement('canvas');

    canvas.width = 1080;
    canvas.height = 1080;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        1080,
        1080
      );

    gradient.addColorStop(
      0,
      '#087f5b'
    );

    gradient.addColorStop(
      1,
      '#14b8a6'
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(
      0,
      0,
      1080,
      1080
    );

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#6ee7b7';

    ctx.beginPath();

    ctx.arc(
      900,
      170,
      210,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.globalAlpha = 1;

    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 38px Arial';

    ctx.fillText(
      'AGEJOY CELEBRATION',
      90,
      180
    );

    ctx.fillStyle = '#fff';
    ctx.font = '700 82px Arial';

    ctx.fillText(
      'Happy Birthday',
      90,
      390
    );

    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 64px Arial';

    ctx.fillText(
      cardName.slice(0, 24),
      90,
      510
    );

    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';

    wrapCanvasText(
      ctx,
      cardMessage,
      90,
      610,
      880,
      52
    );

    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 32px Arial';

    ctx.fillText(
      'Made with AgeJoy',
      90,
      990
    );

    canvas.toBlob(
      blob => {
        if (!blob) return;

        const url =
          URL.createObjectURL(blob);

        const a =
          document.createElement('a');

        a.href = url;
        a.download =
          'AgeJoy-Birthday-Card.png';

        a.click();

        setTimeout(
          () => URL.revokeObjectURL(url),
          1000
        );
      },
      'image/png'
    );
  };

  const sortedBirthdays =
    [...saved].sort(
      (a, b) =>
        daysUntil(a.date) -
        daysUntil(b.date)
    );

  return (
    <div
      className={
        dark
          ? 'min-h-screen bg-slate-950 text-white'
          : 'min-h-screen bg-[#f6f8f5] text-slate-900'
      }
    >
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 p-2.5 text-white">
              <Sparkles size={20}/>
            </div>

            <div>
              <h1 className="font-black">
                AgeJoy
              </h1>

              <p className="text-xs text-slate-500">
                Celebrate every day
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Enable notifications"
              onClick={requestNotifications}
              className="rounded-xl border p-2.5 dark:border-slate-700"
            >
              {notify
                ? <BellRing size={18}/>
                : <Bell size={18}/>
              }
            </button>

            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark(!dark)}
              className="rounded-xl border p-2.5 dark:border-slate-700"
            >
              {dark
                ? <Sun size={18}/>
                : <Moon size={18}/>
              }
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7">
        <section className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-7 text-white shadow-xl">
          <p className="text-sm font-bold tracking-[.18em] text-emerald-100">
            MAKE EVERY MILESTONE COUNT
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-5xl">
            Know your age. Celebrate your journey.
          </h2>

          <p className="mt-3 max-w-2xl text-emerald-50">
            Age calculator, life milestones, birthday reminders, zodiac facts, prayers, motivation, favorites and celebration cards.
          </p>
        </section>

        <nav className="mb-6 grid grid-cols-5 gap-1 rounded-2xl border bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {[
            [CalendarDays,'age'],
            [Cake,'wishes'],
            [Cross,'prayers'],
            [Quote,'motivation'],
            [Star,'cards']
          ].map(([Icon,id]:any) =>
            <button
              key={id}
              onClick={() => setTab(id)}
              className={
                'rounded-xl p-3 ' +
                (tab === id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500')
              }
            >
              <Icon
                size={19}
                className="mx-auto"
              />

              <span className="mt-1 block text-[10px] font-bold capitalize">
                {id}
              </span>
            </button>
          )}
        </nav>

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            {notice}

            <button
              className="ml-3 underline"
              onClick={() => setNotice('')}
            >
              Dismiss
            </button>
          </div>
        )}

        {tab === 'age' && (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <h3 className="font-black">
                  Your dates
                </h3>

                <p className="mb-4 text-sm text-slate-500">
                  Calculate your exact age and birthday countdown.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Label title="Date of birth">
                    <input
                      type="date"
                      value={birthDate}
                      max={today}
                      onChange={e =>
                        setBirthDate(e.target.value)
                      }
                      className="input"
                    />
                  </Label>

                  <Label title="Calculate as of">
                    <input
                      type="date"
                      value={today}
                      onChange={e =>
                        setToday(e.target.value)
                      }
                      className="input"
                    />
                  </Label>
                </div>

                {invalidBirth && (
                  <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                    Date of birth must be a valid date and cannot be after the calculation date.
                  </p>
                )}

                <button
                  onClick={() => {
                    setBirthDate('2000-01-01');
                    setToday(dateValue(new Date()));
                    setNotice('Age calculator reset.');
                  }}
                  className="mt-5 flex gap-2 font-bold text-emerald-700"
                >
                  <RotateCcw size={17}/>
                  Reset
                </button>
              </Card>

              <section className="rounded-3xl bg-slate-900 p-6 text-white">
                <p className="font-bold text-emerald-300">
                  YOUR EXACT AGE
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    [age.years,'Years'],
                    [age.months,'Months'],
                    [age.days,'Days']
                  ].map(([n,l]) =>
                    <div
                      key={String(l)}
                      className="rounded-2xl bg-white/10 p-4"
                    >
                      <b className="text-3xl">
                        {n}
                      </b>

                      <p className="text-xs text-slate-300">
                        {l}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                  <p className="flex justify-between">
                    <span className="text-slate-400">
                      Next birthday
                    </span>

                    <b>
                      {invalidBirth
                        ? '—'
                        : next.toLocaleDateString(
                            undefined,
                            {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            }
                          )}
                    </b>
                  </p>

                  <p className="flex justify-between">
                    <span className="text-slate-400">
                      Countdown
                    </span>

                    <b>
                      {invalidBirth
                        ? '—'
                        : `${days} days`}
                    </b>
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Card>
                <div className="flex items-center gap-2">
                  <Target className="text-emerald-600"/>

                  <h3 className="font-black">
                    Life milestones
                  </h3>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Your journey in memorable numbers.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Stat
                    n={livedDays}
                    l="Days lived"
                  />

                  <Stat
                    n={age.years * 12 + age.months}
                    l="Months lived"
                  />

                  <Stat
                    n={age.years}
                    l="Years celebrated"
                  />

                  <Stat
                    n={Math.floor(
                      Math.max(
                        0,
                        current.getTime() -
                        birth.getTime()
                      ) / 3600000
                    )}
                    l="Hours lived"
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {milestones.map(m =>
                    <div
                      key={m.days}
                      className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30"
                    >
                      🎯 {m.left.toLocaleString()} days until your {m.days.toLocaleString()}-day milestone
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2">
                  <Gem className="text-emerald-600"/>

                  <h3 className="font-black">
                    Zodiac & birthday facts
                  </h3>
                </div>

                <div className="mt-4 rounded-2xl bg-gradient-to-br from-violet-50 to-emerald-50 p-5 dark:from-violet-950/30 dark:to-emerald-950/30">
                  <b className="text-2xl">
                    {zodiac}
                  </b>

                  <p className="mt-2">
                    📅 {facts[0]}
                  </p>

                  <p>
                    💎 Birthstone: {facts[1]}
                  </p>

                  <p>
                    🎨 Lucky color: {facts[2]}
                  </p>
                </div>
              </Card>
            </div>

            <Card className="mt-5">
              <div className="flex items-center gap-2">
                <Bell className="text-emerald-600"/>

                <h3 className="font-black">
                  Birthday reminders & countdown
                </h3>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Save birthdays on this device and schedule native Android reminders.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  placeholder="Person's name"
                  value={person}
                  onChange={e =>
                    setPerson(e.target.value)
                  }
                  className="input"
                />

                <BirthdayDatePicker
                  value={personDate}
                  onChange={setPersonDate}
                />

                <button
                  onClick={addBirthday}
                  disabled={
                    !person.trim() ||
                    !personDate
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus
                    className="inline"
                    size={17}
                  />
                  {' '}Add
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sortedBirthdays.length === 0
                  ? <p className="text-sm text-slate-500">
                      No birthdays saved yet.
                    </p>
                  : sortedBirthdays.map(x =>
                      <div
                        key={x.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"
                      >
                        <div>
                          <b>
                            🎂 {x.name}
                          </b>

                          <p className="text-sm text-slate-500">
                            {daysUntil(x.date)} days to go
                          </p>
                        </div>

                        <button
                          aria-label={`Delete ${x.name}'s birthday`}
                          onClick={() =>
                            void deleteBirthday(x.id)
                          }
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    )}
              </div>
            </Card>
          </>
        )}

        {tab === 'wishes' && (
          <Content title="Wishes & blessings">
            <Tabs
              values={[
                'birthday',
                'month',
                'year'
              ]}
              active={wishType}
              set={(v: 'birthday'|'month'|'year') => {
                setWishType(v);
                setWishIndex(0);
              }}
            />

            <TextBox text={activeText}/>

            <Actions
              copy={copy}
              share={share}
              copied={copied}
              favorite={toggleFavorite}
              isFavorite={isFavorite}
            />

            <p className="mt-3 text-center text-xs font-semibold text-slate-500">
              {wishIndex + 1} of {wishes[wishType].length}
            </p>

            <button
              onClick={() =>
                setWishIndex(
                  i =>
                    (i + 1) %
                    wishes[wishType].length
                )
              }
              className="primary"
            >
              Show another
            </button>
          </Content>
        )}

        {tab === 'prayers' && (
          <Content title="Daily prayer section">
            <Tabs
              values={[
                'morning',
                'evening',
                'success'
              ]}
              active={prayerType}
              set={(v: 'morning'|'evening'|'success') => {
                setPrayerType(v);
                setPrayerIndex(0);
              }}
            />

            <TextBox text={activeText}/>

            <Actions
              copy={copy}
              share={share}
              copied={copied}
              favorite={toggleFavorite}
              isFavorite={isFavorite}
            />

            <button
              onClick={() =>
                setPrayerIndex(
                  i =>
                    (i + 1) %
                    prayers[prayerType].length
                )
              }
              className="primary"
            >
              Another prayer
            </button>
          </Content>
        )}

        {tab === 'motivation' && (
          <Content title="Your daily motivation">
            <TextBox text={activeText}/>

            <Actions
              copy={copy}
              share={share}
              copied={copied}
              favorite={toggleFavorite}
              isFavorite={isFavorite}
            />

            <button
              onClick={() =>
                setQuoteIndex(
                  i =>
                    (i + 1) %
                    quotes.length
                )
              }
              className="primary"
            >
              New motivation
            </button>

            <div className="mt-5 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/30">
              🎯 <b>Today’s reminder</b>

              <p className="mt-1">
                Protect your peace, do one important thing well, and be grateful for your progress.
              </p>
            </div>
          </Content>
        )}

        {tab === 'cards' && (
          <Content title="Birthday card generator">
            <p className="mb-4 text-sm text-slate-500">
              Create a celebration card you can download as a PNG image and share.
            </p>

            <input
              value={cardName}
              onChange={e =>
                setCardName(e.target.value)
              }
              placeholder="Recipient name"
              className="input mb-3"
            />

            <textarea
              value={cardMessage}
              onChange={e =>
                setCardMessage(e.target.value)
              }
              className="input min-h-28"
            />

            <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-500 p-8 text-center text-white">
              <p className="text-sm tracking-widest">
                AGEJOY CELEBRATION
              </p>

              <h3 className="mt-4 text-3xl font-black">
                Happy Birthday, {cardName}! 🎂
              </h3>

              <p className="mx-auto mt-4 max-w-xl">
                {cardMessage}
              </p>

              <p className="mt-6 text-sm text-emerald-100">
                Made with AgeJoy ✨
              </p>
            </div>

            <button
              onClick={downloadCard}
              className="primary"
            >
              <Download
                className="inline"
                size={17}
              />
              {' '}Download PNG card
            </button>
          </Content>
        )}

        {favorites.length > 0 && (
          <Card className="mt-6">
            <div className="flex items-center gap-2">
              <Heart className="text-emerald-600"/>

              <h3 className="font-black">
                Favorites
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Your saved wishes, prayers and motivations stay on this device.
            </p>

            <div className="mt-4 space-y-3">
              {favorites.map(f =>
                <div
                  key={f.id}
                  className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      “{f.text}”
                    </p>

                    <button
                      aria-label="Remove favorite"
                      onClick={() =>
                        setFavorites(
                          v =>
                            v.filter(
                              x => x.id !== f.id
                            )
                        )
                      }
                    >
                      <Trash2 size={17}/>
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-bold uppercase text-emerald-700">
                    {f.category}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card className="mt-6">
          <div className="flex items-center gap-2">
            <BellRing className="text-emerald-600"/>

            <div>
              <h3 className="font-black">
                Notifications
              </h3>

              <p className="text-sm text-slate-500">
                Enable native Android birthday reminders. AgeJoy does not need contacts, phone, storage or overlay access.
              </p>
            </div>
          </div>

          <button
            onClick={requestNotifications}
            className="primary"
          >
            {notify
              ? 'Refresh birthday reminders'
              : 'Enable notifications'}
          </button>
        </Card>

        <footer className="py-10 text-center text-xs text-slate-400">
          AgeJoy • Celebrate every day with purpose, gratitude and hope.
          <br/>

          <a
            href="./privacy-policy.html"
            className="mt-3 inline-block font-bold text-emerald-700 underline"
          >
            Privacy Policy
          </a>

          <span className="mx-2">
            •
          </span>

          <span>
            Current build: no advertising or analytics SDK
          </span>
        </footer>
      </main>
    </div>
  );
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/);
  let line = '';

  for (const word of words) {
    const test =
      line
        ? `${line} ${word}`
        : word;

    if (
      ctx.measureText(test).width >
        maxWidth &&
      line
    ) {
      ctx.fillText(
        line,
        x,
        y
      );

      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }

  if (line) {
    ctx.fillText(
      line,
      x,
      y
    );
  }
}

function BirthdayDatePicker({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void
}) {
  const parse = () => {
    const [y,m,d] =
      value
        ? value.split('-')
        : ['','',''];

    return {
      y: y || '',
      m: m
        ? String(Number(m))
        : '',
      d: d
        ? String(Number(d))
        : ''
    };
  };

  const [parts,setParts] =
    useState(parse);

  useEffect(() => {
    setParts(parse());
  }, [value]);

  const currentYear =
    new Date().getFullYear();

  const years =
    Array.from(
      {
        length:
          currentYear -
          1899 +
          6
      },
      (_,i) =>
        String(
          currentYear +
          5 -
          i
        )
    );

  const months = [
    ['1','January'],
    ['2','February'],
    ['3','March'],
    ['4','April'],
    ['5','May'],
    ['6','June'],
    ['7','July'],
    ['8','August'],
    ['9','September'],
    ['10','October'],
    ['11','November'],
    ['12','December']
  ];

  const days =
    Array.from(
      { length: 31 },
      (_,i) =>
        String(i + 1)
    );

  const update = (
    key: 'y'|'m'|'d',
    next: string
  ) => {
    const p = {
      ...parts,
      [key]: next
    };

    const year =
      Number(
        p.y ||
        currentYear
      );

    const month =
      Number(
        p.m ||
        1
      );

    if (
      (key === 'm' ||
       key === 'y') &&
      p.d &&
      Number(p.d) >
        daysInMonth(
          year,
          month - 1
        )
    ) {
      p.d =
        String(
          daysInMonth(
            year,
            month - 1
          )
        );
    }

    setParts(p);

    if (
      p.y &&
      p.m &&
      p.d
    ) {
      onChange(
        `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`
      );
    } else {
      onChange('');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Birthday month"
        value={parts.m}
        onChange={e =>
          update(
            'm',
            e.target.value
          )
        }
        className="input"
      >
        <option value="">
          Month
        </option>

        {months.map(
          ([n,label]) =>
            <option
              key={n}
              value={n}
            >
              {label}
            </option>
        )}
      </select>

      <select
        aria-label="Birthday day"
        value={parts.d}
        onChange={e =>
          update(
            'd',
            e.target.value
          )
        }
        className="input"
      >
        <option value="">
          Day
        </option>

        {days.map(
          n =>
            <option
              key={n}
              value={n}
            >
              {n}
            </option>
        )}
      </select>

      <select
        aria-label="Birthday year"
        value={parts.y}
        onChange={e =>
          update(
            'y',
            e.target.value
          )
        }
        className="input"
      >
        <option value="">
          Year
        </option>

        {years.map(
          y =>
            <option
              key={y}
              value={y}
            >
              {y}
            </option>
        )}
      </select>
    </div>
  );
}

function Card({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string
}) {
  return (
    <section
      className={
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 ' +
        className
      }
    >
      {children}
    </section>
  );
}

function Content({
  title,
  children
}: {
  title: string;
  children: React.ReactNode
}) {
  return (
    <Card>
      <h3 className="mb-5 text-2xl font-black">
        {title}
      </h3>

      {children}
    </Card>
  );
}

function Label({
  title,
  children
}: {
  title: string;
  children: React.ReactNode
}) {
  return (
    <label className="text-sm font-bold">
      {title}
      {children}
    </label>
  );
}

function Tabs({
  values,
  active,
  set
}: {
  values: string[];
  active: string;
  set: (v: any) => void
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {values.map(
        v =>
          <button
            key={v}
            onClick={() => set(v)}
            className={
              'rounded-full px-4 py-2 text-sm font-bold capitalize ' +
              (
                active === v
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
              )
            }
          >
            {
              v === 'success'
                ? 'Success'
                : v === 'month'
                  ? 'New Month'
                  : v === 'year'
                    ? 'New Year'
                    : v
            }
          </button>
      )}
    </div>
  );
}

function TextBox({
  text
}: {
  text: string
}) {
  return (
    <div className="rounded-3xl bg-emerald-50 p-7 dark:bg-emerald-950/30">
      <p className="text-xl font-bold leading-relaxed">
        “{text}”
      </p>
    </div>
  );
}

function Actions({
  copy,
  share,
  copied,
  favorite,
  isFavorite
}: {
  copy: () => void;
  share: () => void;
  copied: boolean;
  favorite: () => void;
  isFavorite: boolean
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <button
        onClick={copy}
        className="flex items-center justify-center gap-2 rounded-xl border py-3 font-bold dark:border-slate-700"
      >
        {copied
          ? <Check size={17}/>
          : <RotateCcw size={17}/>
        }

        {copied
          ? 'Copied'
          : 'Copy'}
      </button>

      <button
        onClick={share}
        className="flex items-center justify-center gap-2 rounded-xl border py-3 font-bold dark:border-slate-700"
      >
        <Share2 size={17}/>
        Share
      </button>

      <button
        onClick={favorite}
        className="flex items-center justify-center gap-2 rounded-xl border py-3 font-bold dark:border-slate-700"
      >
        <Heart
          size={17}
          fill={
            isFavorite
              ? 'currentColor'
              : 'none'
          }
        />

        {isFavorite
          ? 'Saved'
          : 'Favorite'}
      </button>
    </div>
  );
}

function Stat({
  n,
  l
}: {
  n: number;
  l: string
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800">
      <b className="text-xl">
        {Number(n).toLocaleString()}
      </b>

      <p className="text-xs text-slate-500">
        {l}
      </p>
    </div>
  );
}
