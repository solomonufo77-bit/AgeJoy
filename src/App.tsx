import { useEffect, useMemo, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Bell, BellRing, Cake, CalendarDays, Check, Moon, Quote, RotateCcw, Share2, Sparkles, Sun, Target, Cross, Gem, Star, Download, Plus, Trash2, Heart } from 'lucide-react';

type Age = { years: number; months: number; days: number };
type SavedBirthday = { id: string; name: string; date: string };
type Favorite = { id: string; category: string; text: string };
type ContentKey = 'birthday' | 'month' | 'year' | 'morning' | 'evening' | 'success' | 'motivation';

const quotes = ['Small steps every day become remarkable progress.','Your future is built by what you do today.','Keep going. You are closer than you think.','Discipline turns dreams into plans and actions.','Every challenge you overcome makes you stronger.','Progress is the most important progress.','Success is built on a foundation of daily effort.','Your potential is limitless when you believe in yourself.'];
const prayers = { morning: ['May this morning bring peace to your heart, strength to your body, wisdom to your decisions, and favor to your path. Amen.','May today open doors of opportunity and fill your life with endless blessings. Amen.','Guide my steps today with truth and purpose, fill my day with hope. Amen.'], evening: ['Grateful for today\'s journey, may tomorrow bring more blessings. Amen.','Rest well knowing your efforts were valued today. Amen.','May peaceful sleep restore your soul and strength. Amen.'], success: ['May my efforts bear fruit and my dreams come true. Amen.','I am capable, strong, and destined for greatness. Amen.','Success flows to me with every step I take. Amen.'] };
const wishes = { birthday: ['Happy Birthday! May your new age bring you greater joy, good health, favor, and beautiful memories. 🎂','May this birthday mark the beginning of an amazing chapter full of achievements and love.','Wishing you a birthday filled with blessings, laughter, and unforgettable moments. Happy Birthday!'], month: ['May this month bring unexpected blessings and new opportunities.','This month is a fresh start—make it count!','I wish you progress and peace in all you do this month.'], year: ['Here\'s to a year of growth, success, and endless possibilities!','May this year exceed your expectations and fulfill your dreams.','Wishing you a year filled with purpose, joy, and remarkable achievements.'] };
const zodiacFacts: Record<string, [string, string, string]> = { Aquarius: ['January 20 – February 18','Amethyst','Violet'], Pisces: ['February 19 – March 20','Aquamarine','Sea Green'], Aries: ['March 21 – April 19','Diamond','Red'], Taurus: ['April 20 – May 20','Emerald','Green'], Gemini: ['May 21 – June 20','Pearl','Yellow'], Cancer: ['June 21 – July 22','Ruby','Silver'], Leo: ['July 23 – August 22','Peridot','Gold'], Virgo: ['August 23 – September 22','Sapphire','Navy'], Libra: ['September 23 – October 22','Opal','Blue'], Scorpio: ['October 23 – November 21','Topaz','Maroon'], Sagittarius: ['November 22 – December 21','Turquoise','Purple'], Capricorn: ['December 22 – January 19','Garnet','Brown'] };

function dateValue(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function parseDate(value: string) { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d); }
function daysInMonth(year: number, monthIndex: number) { return new Date(year, monthIndex + 1, 0).getDate(); }
function annualBirthday(year: number, month: number, day: number) { return new Date(year, month, Math.min(day, daysInMonth(year, month))); }
function calculateAge(b: Date, t: Date): Age {
  if (t < b) return { years: 0, months: 0, days: 0 };
  let years = t.getFullYear() - b.getFullYear();
  const birthdayThisYear = annualBirthday(t.getFullYear(), b.getMonth(), b.getDate());
  if (t < birthdayThisYear) years--;
  years = Math.max(0, years);
  const anchor = annualBirthday(b.getFullYear() + years, b.getMonth(), b.getDate());
  let months = (t.getFullYear() - anchor.getFullYear()) * 12 + (t.getMonth() - anchor.getMonth());
  if (t.getDate() < anchor.getDate()) months--;
  months = Math.max(0, months);
  const monthAnchor = new Date(anchor.getFullYear(), anchor.getMonth() + months, Math.min(anchor.getDate(), daysInMonth(anchor.getFullYear(), anchor.getMonth() + months)));
  const days = Math.floor((t.getTime() - monthAnchor.getTime()) / 86400000);
  return { years, months, days: Math.max(0, days) };
}
function nextBirthday(b: Date, n: Date) { let x = annualBirthday(n.getFullYear(), b.getMonth(), b.getDate()); if (x < n) x = annualBirthday(n.getFullYear() + 1, b.getMonth(), b.getDate()); return x; }
function zodiacFor(b: Date) { const md = (b.getMonth() + 1) * 100 + b.getDate(); if (md >= 120 && md <= 218) return 'Aquarius'; if (md <= 320) return 'Pisces'; if (md <= 419) return 'Aries'; if (md <= 520) return 'Taurus'; if (md <= 620) return 'Gemini'; if (md <= 722) return 'Cancer'; if (md <= 822) return 'Leo'; if (md <= 922) return 'Virgo'; if (md <= 1022) return 'Libra'; if (md <= 1121) return 'Scorpio'; if (md <= 1221) return 'Sagittarius'; return 'Capricorn'; }
function daysUntil(date: string) { const [, month, day] = date.split('-').map(Number); const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); let next = new Date(now.getFullYear(), month - 1, day); if (next <= start) next = new Date(now.getFullYear() + 1, month - 1, day); return Math.round((next.getTime() - start.getTime()) / 86400000); }
function notificationId(seed: string) { let hash = 0; for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0; return Math.max(1, hash % 2000000000); }

export default function App() {
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [today, setToday] = useState(dateValue(new Date()));
  const [dark, setDark] = useState(() => localStorage.getItem('agejoy_dark') === 'true');
  const [tab, setTab] = useState<'age'|'wishes'|'prayers'|'motivation'|'cards'>('age');
  const [wishType, setWishType] = useState<'birthday'|'month'|'year'>('birthday');
  const [wishIndex, setWishIndex] = useState(0);
  const [prayerType, setPrayerType] = useState<'morning'|'evening'|'success'>('morning');
  const [prayerIndex, setPrayerIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDate() % quotes.length);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<SavedBirthday[]>(() => { try { return JSON.parse(localStorage.getItem('agejoy_birthdays') || '[]'); } catch { return []; } });
  const [favorites, setFavorites] = useState<Favorite[]>(() => { try { return JSON.parse(localStorage.getItem('agejoy_favorites') || '[]'); } catch { return []; } });
  const [person, setPerson] = useState('');
  const [personDate, setPersonDate] = useState('');
  const [cardName, setCardName] = useState('Dear Friend');
  const [cardMessage, setCardMessage] = useState('Happy Birthday! Wishing you joy, good health, success and beautiful memories in your new age.');
  const [notify, setNotify] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('agejoy_dark', String(dark)); }, [dark]);
  useEffect(() => { localStorage.setItem('agejoy_birthdays', JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem('agejoy_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { LocalNotifications.checkPermissions().then(result => setNotify(result.display === 'granted')).catch(() => { if (typeof Notification !== 'undefined') setNotify(Notification.permission === 'granted'); }); }, []);

  const birth = useMemo(() => parseDate(birthDate), [birthDate]);
  const current = useMemo(() => parseDate(today), [today]);
  const invalidBirth = Number.isNaN(birth.getTime()) || Number.isNaN(current.getTime()) || birth > current;
  const age = useMemo(() => calculateAge(birth, current), [birth, current]);
  const next = useMemo(() => nextBirthday(birth, current), [birth, current]);
  const days = invalidBirth ? 0 : Math.max(0, Math.round((next.getTime() - current.getTime()) / 86400000));
  const zodiac = zodiacFor(birth);
  const facts = zodiacFacts[zodiac];
  const livedDays = invalidBirth ? 0 : Math.floor((current.getTime() - birth.getTime()) / 86400000);
  const milestones = [1000, 5000, 10000, 15000, 20000].map(x => ({ days: x, left: Math.max(0, x - livedDays) })).filter(x => x.left > 0).slice(0, 3);
  const activeText = tab === 'motivation' ? quotes[quoteIndex] : tab === 'prayers' ? prayers[prayerType][prayerIndex] : wishes[wishType][wishIndex];
  const activeCategory: ContentKey = tab === 'motivation' ? 'motivation' : tab === 'prayers' ? prayerType : wishType;
  const isFavorite = favorites.some(f => f.text === activeText);

  const copy = async () => { try { await navigator.clipboard.writeText(activeText); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { setNotice('Copy is unavailable on this device.'); } };
  const share = async () => {
    try {
      await Share.share({ title: 'AgeJoy', text: activeText, dialogTitle: 'Share from AgeJoy' });
    } catch {
      try {
        if (navigator.share) await navigator.share({ title: 'AgeJoy', text: activeText });
        else await copy();
      } catch { /* user cancelled */ }
    }
  };
  const toggleFavorite = () => { if (isFavorite) setFavorites(v => v.filter(f => f.text !== activeText)); else setFavorites(v => [...v, { id: `${Date.now()}`, category: activeCategory, text: activeText }]); };

  const scheduleBirthdayNotifications = async (birthdays: SavedBirthday[], requestPermission = false) => {
    const permission = requestPermission ? await LocalNotifications.requestPermissions() : await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return false;
    await LocalNotifications.createChannel({ id: 'agejoy-birthdays', name: 'Birthday reminders', description: 'Birthday reminders from AgeJoy', importance: 4, vibration: true, lights: true });
    const now = new Date();
    const yearsToClear = Array.from({ length: 16 }, (_, i) => now.getFullYear() - 5 + i);
    const idsToClear = birthdays.flatMap(x => yearsToClear.map(year => notificationId(`${x.id}-${year}`)));
    if (idsToClear.length) await LocalNotifications.cancel({ notifications: idsToClear.map(id => ({ id })) });
    const notifications = birthdays.flatMap(x => {
      const [, m, d] = x.date.split('-').map(Number);
      return [0, 1, 2, 3, 4].map(offset => {
        const year = now.getFullYear() + offset;
        const at = annualBirthday(year, m - 1, d); at.setHours(9, 0, 0, 0);
        if (at <= now) return null;
        return { id: notificationId(`${x.id}-${year}`), title: `🎂 ${x.name}'s birthday`, body: offset === 0 ? 'Today is the day! Celebrate them with AgeJoy.' : `Save the date — ${x.name}'s birthday is coming up!` };
      }).filter(Boolean);
    });
    if (notifications.length) await LocalNotifications.schedule({ notifications: notifications as any });
    return true;
  };
  const scheduleNotifications = async () => {
    try {
      const granted = await scheduleBirthdayNotifications(saved, true);
      if (!granted) { setNotify(false); setNotice('Notifications were not allowed. You can enable them later in Android Settings.'); return; }
      setNotify(true); setNotice(saved.length ? 'Birthday notifications are enabled. Reminders are scheduled for the next 5 years.' : 'Notifications are enabled. Add birthdays to schedule reminders.');
    } catch {
      if (typeof Notification !== 'undefined') {
        const permission = await Notification.requestPermission();
        setNotify(permission === 'granted');
        if (permission === 'granted') new Notification('AgeJoy is ready!', { body: 'You can use AgeJoy reminders and inspiration.' });
      } else setNotice('Notifications are not available on this device.');
    }
  };
  const requestNotifications = () => void scheduleNotifications();

  const addBirthday = () => {
    if (!person.trim() || !personDate) return;
    const newBirthday: SavedBirthday = { id: `${Date.now()}`, name: person.trim(), date: personDate };
    const nextSaved = [...saved, newBirthday];
    setSaved(nextSaved); setPerson(''); setPersonDate('');
    if (notify) void scheduleBirthdayNotifications(nextSaved).catch(() => undefined);
    setNotice(notify ? 'Birthday saved and its reminder was scheduled.' : 'Birthday saved. Tap Enable notifications to schedule its reminder.');
  };
  const deleteBirthday = async (id: string) => {
    const nextSaved = saved.filter(x => x.id !== id);
    setSaved(nextSaved);
    if (notify) {
      try {
        const now = new Date();
        const ids = Array.from({ length: 16 }, (_, i) => now.getFullYear() - 5 + i).map(year => notificationId(`${id}-${year}`));
        await LocalNotifications.cancel({ notifications: ids.map(notificationIdValue => ({ id: notificationIdValue })) });
      } catch { /* notification cleanup is best effort */ }
    }
  };
  const downloadCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setNotice('Unable to create the birthday card image.');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#087f5b');
    gradient.addColorStop(1, '#14b8a6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.globalAlpha = .25;
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.arc(900, 170, 210, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 38px Arial';
    ctx.fillText('AGEJOY CELEBRATION', 90, 180);
    ctx.fillStyle = '#fff';
    ctx.font = '700 82px Arial';
    ctx.fillText('Happy Birthday', 90, 390);
    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 64px Arial';
    ctx.fillText(cardName.slice(0, 24), 90, 510);
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    wrapCanvasText(ctx, cardMessage, 90, 610, 880, 52);
    ctx.fillStyle = '#d1fae5';
    ctx.font = '700 32px Arial';
    ctx.fillText('Made with AgeJoy', 90, 990);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error('Could not create PNG'));
        }, 'image/png');
      });

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'));
        reader.onerror = () => reject(reader.error || new Error('Could not read image'));
        reader.readAsDataURL(blob);
      });
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('Invalid image data');

      await Filesystem.writeFile({
        path: 'AgeJoy-Birthday-Card.png',
        data: base64,
        directory: Directory.Documents,
        recursive: true,
      });
      setNotice('Birthday card saved as AgeJoy-Birthday-Card.png in the app Documents folder.');
    } catch {
      try {
        const blob = blobFromCanvas(canvas);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AgeJoy-Birthday-Card.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice('Birthday card download started.');
      } catch {
        setNotice('Could not save the birthday card on this device.');
      }
    }
  };

  const sortedBirthdays = [...saved].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  return <div className={dark ? 'min-h-screen bg-slate-950 text-white' : 'min-h-screen bg-[#f6f8f5] text-slate-900'}>
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><h1 className="text-2xl font-black">🎂 AgeJoy</h1><button onClick={() => setDark(!dark)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">{dark ? <Sun size={20}/> : <Moon size={20}/>}</button></div></header>
    <main className="mx-auto max-w-6xl px-5 py-7"><section className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-7 text-white shadow-xl"><p className="text-lg font-semibold">🎉 Celebrate your age with purpose, gratitude, and inspiration every day.</p></section>
      <nav className="mb-6 grid grid-cols-5 gap-1 rounded-2xl border bg-white p-1 dark:border-slate-800 dark:bg-slate-900">{[[CalendarDays,'age'],[Cake,'wishes'],[Cross,'prayers'],[Quote,'motivation'],[Sparkles,'cards']].map(([Icon,k])=><button key={k} onClick={()=>setTab(k as any)} className={`flex flex-col items-center justify-center gap-1 rounded-xl py-3 font-bold transition ${tab===k?'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300':'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Icon size={20}/><span className="text-xs">{k}</span></button>)}</nav>
      {notice && <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</div>}
      {tab==='age'&&<><div className="grid gap-5 lg:grid-cols-2"><Card><h3 className="font-black">Your dates</h3><p className="mb-4 text-sm text-slate-500">Calculate your exact age and birthday countdown.</p><Label title="Birth date"><BirthdayDatePicker value={birthDate} onChange={setBirthDate}/></Label><Label title="Today"><input type="date" value={today} onChange={e=>setToday(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"/></Label></Card><Card><h3 className="font-black">Your exact age</h3><div className="mt-6 grid grid-cols-3 gap-2">{[['Years',age.years],['Months',age.months],['Days',age.days]].map(([l,n])=><Stat key={l} n={n as number} l={l as string}/>)}</div></Card></div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2"><Card><div className="flex items-center gap-2"><Target className="text-emerald-600"/><h3 className="font-black">Life milestones</h3></div><div className="mt-4 space-y-2">{milestones.length?milestones.map(m=><div key={m.days} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800"><b>{m.days.toLocaleString()} days</b> lived<br/><span className="text-slate-500 dark:text-slate-400">{m.left.toLocaleString()} days until</span></div>):<p className="text-sm text-slate-500">Amazing! You've already surpassed 20,000 days!</p>}</div></Card>
          <Card><div className="flex items-center gap-2"><Gem className="text-emerald-600"/><h3 className="font-black">Zodiac & birthday facts</h3></div><div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-center dark:from-slate-800 dark:to-slate-900"><p className="text-3xl font-black">{zodiac}</p>{facts && <><p className="mt-2 text-sm font-semibold">{facts[0]}</p><p className="mt-3 text-sm">💎 {facts[1]} | {facts[2]}</p></>}</div></Card>
        </div>
        <Card className="mt-5"><div className="flex items-center gap-2"><Bell className="text-emerald-600"/><h3 className="font-black">Birthday reminders & countdown</h3></div><p className="mt-1 text-sm text-slate-500">You have {saved.length} birthday{saved.length!==1?'s':''} saved.</p><div className="mt-4 space-y-3">{sortedBirthdays.length?sortedBirthdays.map(b=>{const d=daysUntil(b.date);return <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div><p className="font-semibold">{b.name}</p><p className="text-sm text-slate-500">{d} days away</p></div><button onClick={()=>deleteBirthday(b.id)} className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900"><Trash2 size={18} className="text-red-600"/></button></div>}):<p className="text-sm text-slate-500">No birthdays yet. Add one below!</p>}</div><div className="mt-5 space-y-2"><input type="text" placeholder="Person\'s name" value={person} onChange={e=>setPerson(e.target.value)} maxLength={30} className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"/><BirthdayDatePicker value={personDate} onChange={setPersonDate}/><div className="flex gap-2"><button onClick={addBirthday} className="flex-1 rounded-lg bg-emerald-600 py-2 font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-2"><Plus size={18}/>Add</button>{!notify && <button onClick={requestNotifications} className="flex-1 rounded-lg border border-emerald-600 py-2 font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center justify-center gap-2"><BellRing size={18}/>Enable</button>}</div></div></Card>
      </>}
      {tab==='wishes'&&<Content title="Wishes & blessings"><Tabs values={['birthday','month','year']} active={wishType} set={(v: 'birthday'|'month'|'year')=>{setWishType(v);setWishIndex(0)}}/><TextBox text={activeText}/><Actions copy={copy} share={share} copied={copied} favorite={toggleFavorite} isFavorite={isFavorite}/></Content>}
      {tab==='prayers'&&<Content title="Daily prayer section"><Tabs values={['morning','evening','success']} active={prayerType} set={(v: 'morning'|'evening'|'success')=>{setPrayerType(v);setPrayerIndex(0)}}/><TextBox text={activeText}/><Actions copy={copy} share={share} copied={copied} favorite={toggleFavorite} isFavorite={isFavorite}/></Content>}
      {tab==='motivation'&&<Content title="Your daily motivation"><TextBox text={activeText}/><Actions copy={copy} share={share} copied={copied} favorite={toggleFavorite} isFavorite={isFavorite}/><Tabs values={quotes.map((_,i)=>String(i+1))} active={String(quoteIndex+1)} set={(v)=>setQuoteIndex(Number(v)-1)}/></Content>}
      {tab==='cards'&&<Content title="Birthday card generator"><p className="mb-4 text-sm text-slate-500">Create a celebration card you can download as a PNG image and share.</p><input value={cardName} onChange={e=>setCardName(e.target.value)} maxLength={24} placeholder="Person\'s name" className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"/><textarea value={cardMessage} onChange={e=>setCardMessage(e.target.value)} maxLength={200} placeholder="Your message" className="mb-3 h-24 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 resize-none"/><button onClick={downloadCard} className="w-full rounded-lg bg-emerald-600 py-2 font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-2"><Download size={18}/>Download Card</button></Content>}
      {favorites.length>0&&<Card className="mt-6"><div className="flex items-center gap-2"><Heart className="text-emerald-600"/><h3 className="font-black">Favorites</h3></div><p className="mt-1 text-sm text-slate-500">{favorites.length} saved {favorites.length===1?'favorite':'favorites'}.</p><div className="mt-4 space-y-2">{favorites.map(f=><div key={f.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">"{f.text}"<p className="mt-2 text-xs text-slate-500">From {f.category}</p></div>)}</div></Card>}
      <Card className="mt-6"><div className="flex items-center gap-2"><BellRing className="text-emerald-600"/><div><h3 className="font-black">Notifications</h3><p className="text-sm text-slate-500">{notify?'Enabled':'Disabled'}</p></div></div><button onClick={requestNotifications} className={`mt-3 w-full rounded-lg py-2 font-bold ${notify?'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700':'bg-emerald-600 text-white hover:bg-emerald-700'}`}>{notify?'Manage':'Enable'} Notifications</button></Card>
      <footer className="py-10 text-center text-xs text-slate-400">AgeJoy • Celebrate every day with purpose, gratitude and hope.<br/><a href="./privacy-policy.html" className="mt-3 inline-block hover:underline">Privacy Policy</a></footer>
    </main>
  </div>;
}

function blobFromCanvas(canvas: HTMLCanvasElement): Blob {
  const dataUrl = canvas.toDataURL('image/png');
  const binary = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}
function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) { const words = text.split(/\s+/); let line = ''; for (const word of words) { const testLine = line + (line ? ' ' : '') + word; const metrics = ctx.measureText(testLine); if (metrics.width > maxWidth && line) { ctx.fillText(line, x, y); y += lineHeight; line = word; } else line = testLine; } ctx.fillText(line, x, y); }
function BirthdayDatePicker({value,onChange}:{value:string;onChange:(value:string)=>void}) { const parse=()=>{const [y,m,d]=value?value.split('-'):['','',''];return{y:y||'',m:m?String(Number(m)):'',d:d||''}}; const{y,m,d}=parse(); const update=(ny:string,nm:string,nd:string)=>onChange(`${ny||'2000'}-${String(Number(nm)||1).padStart(2,'0')}-${String(Number(nd)||1).padStart(2,'0')}`); return<div className="mt-2 flex gap-2"><input type="number" placeholder="YYYY" value={y} onChange={e=>update(e.target.value,m,d)} min="1900" max={new Date().getFullYear()} className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"/><input type="number" placeholder="MM" value={m} onChange={e=>update(y,e.target.value,d)} min="1" max="12" className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"/><input type="number" placeholder="DD" value={d} onChange={e=>update(y,m,e.target.value)} min="1" max="31" className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"/></div>; }
function Card({children,className=''}:{children:React.ReactNode;className?:string}){return <section className={'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 '+className}>{children}</section>}
function Content({title,children}:{title:string;children:React.ReactNode}){return <Card><h3 className="mb-5 text-2xl font-black">{title}</h3>{children}</Card>}
function Label({title,children}:{title:string;children:React.ReactNode}){return <label className="text-sm font-bold">{title}{children}</label>}
function Tabs({values,active,set}:{values:string[];active:string;set:(v:any)=>void}){return <div className="mb-5 flex flex-wrap gap-2">{values.map(v=><button key={v} onClick={()=>set(v)} className={`rounded-lg px-3 py-1 text-sm font-bold transition ${active===v?'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300':'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{v}</button>)}</div>}
function TextBox({text}:{text:string}){return <div className="rounded-3xl bg-emerald-50 p-7 dark:bg-emerald-950/30"><p className="text-xl font-bold leading-relaxed">"{text}"</p></div>}
function Actions({copy,share,copied,favorite,isFavorite}:{copy:()=>void;share:()=>void;copied:boolean;favorite:()=>void;isFavorite:boolean}){return <div className="mt-4 grid grid-cols-3 gap-3"><button onClick={copy} className={`flex items-center justify-center gap-2 rounded-lg py-2 font-bold ${copied?'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300':'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}><Check size={18}/>{copied?'Copied':'Copy'}</button><button onClick={share} className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"><Share2 size={18}/>Share</button><button onClick={favorite} className={`flex items-center justify-center gap-2 rounded-lg py-2 font-bold ${isFavorite?'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300':'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}><Heart size={18} fill={isFavorite?'currentColor':'none'}/></button></div>}
function Stat({n,l}:{n:number;l:string}){return <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800"><b className="text-xl">{Number(n).toLocaleString()}</b><p className="text-xs text-slate-500">{l}</p></div>}
