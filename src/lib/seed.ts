import { DEFAULT_CONFIG } from './config';
import type { Agent, Booking, DBShape, Doc, Provider, Task, User } from './types';

export const uid = (p: string) => p + '_' + Math.random().toString(36).slice(2, 8);
export const now = () => new Date().toISOString();
export const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

const USERS: User[] = [
  { id: 'u_asha', name: 'Asha Verma', role: 'customer', phone: '98•••• ••210', city: 'Delhi', lang: 'hinglish', plan: 'smart', credits: 840, wallet: 4200, easy: false, avatar: 'AV',
    memory: { operator: 'Jio', home: 'B-42, Rajouri Garden, Delhi', work: 'Connaught Place', budget: 'Under ₹1,000 for repairs', travel: 'Sleeper or 3AC, night trains' } },
  { id: 'u_ram', name: 'Ram Prasad (age 71)', role: 'customer', phone: '99•••• ••118', city: 'Kanpur', lang: 'hi', plan: 'family', credits: 5100, wallet: 2500, easy: true, avatar: 'RP',
    memory: { operator: 'BSNL', home: '12/8 Civil Lines, Kanpur', budget: 'Keep it cheap', travel: 'Lower berth only' } },
  { id: 'u_nidhi', name: 'Nidhi Rao', role: 'customer', phone: '90•••• ••444', city: 'Bengaluru', lang: 'en', plan: 'family', credits: 4400, wallet: 6000, easy: false, avatar: 'NR',
    memory: { operator: 'Airtel', home: 'HSR Layout, Bengaluru', budget: 'Convenience over cost' } },
  { id: 'a_iqbal', name: 'Iqbal Ahmed', role: 'agent', city: 'Lucknow', lang: 'hi', avatar: 'IA' },
  { id: 'p_ramesh', name: 'Ramesh Electric Works', role: 'provider', phone: '98200•••••', city: 'Mumbai', lang: 'mr', avatar: 'RE' },
  { id: 'p_kirti', name: 'Kirti Cool Care', role: 'provider', phone: '99115•••••', city: 'Delhi', lang: 'hi', avatar: 'KC' },
  { id: 'p_maya', name: 'Maya Home Salon', role: 'provider', phone: '96201•••••', city: 'Delhi', lang: 'hi', avatar: 'MH' },
  { id: 'a_mohan', name: 'Mohan Sharma', role: 'agent', phone: '97801•••••', city: 'Jaipur', lang: 'hi', avatar: 'MS' },
  { id: 'a_kiran', name: 'Kiran Reddy', role: 'agent', phone: '96501•••••', city: 'Hyderabad', lang: 'te', avatar: 'KR' },
  { id: 'p_suresh', name: 'Suresh Electricals', role: 'provider', city: 'Delhi', lang: 'hi', avatar: 'SE' },
  { id: 'ad_root', name: 'Ops Admin', role: 'admin', city: 'Delhi', lang: 'en', avatar: 'OA' },
];

const PROVIDERS: Provider[] = [
  // ── Delhi ──
  { id: 'p_suresh', name: 'Suresh Electricals', owner: 'Suresh Kumar', phone: '98104•••••', city: 'Delhi', locality: 'Rajouri Garden',
    cat: 'Electrician', exp: 11, lang: ['hi', 'en'],
    bio: '11 साल का अनुभव। घर और दुकान दोनों का काम। छत के पंखे से लेकर मेन MCB तक सब ठीक करता हूँ।',
    rating: 4.8, jobs: 412, radius: 6, eta: 25, base: 249, hourly: 350,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: false, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified', 'Top rated'], resp: 6, completion: 0.97, x: 34, y: 44, open: true, lat: 28.6425, lng: 77.1225,
    bank: 'SBI ••4412', payout_cycle: 'weekly',
    avail: { Mon: ['9-13', '14-19'], Tue: ['9-13', '14-19'], Wed: ['9-13'], Thu: ['9-13', '14-19'], Fri: ['9-13', '14-19'], Sat: ['9-14'], Sun: [] },
    reviews_count: 318, rating_hist: { 5: 240, 4: 55, 3: 18, 2: 4, 1: 1 }, cancelled: 8, disputes: 2, joined: 'Jan 2022' },

  { id: 'p_kirti', name: 'Kirti Cool Care', owner: 'Kirti Sharma', phone: '99115•••••', city: 'Delhi', locality: 'Tilak Nagar',
    cat: 'AC technician', exp: 8, lang: ['hi'],
    bio: 'AC सर्विसिंग, गैस टॉप-अप, पुराने AC की मरम्मत। मौसम से पहले बुक करें।',
    rating: 4.6, jobs: 288, radius: 9, eta: 40, base: 399, hourly: 500,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: false,
    badges: ['Identity verified', 'Skill certified'], resp: 11, completion: 0.94, x: 58, y: 30, open: true, lat: 28.6414, lng: 77.0958,
    bank: 'HDFC ••8821', payout_cycle: 'weekly',
    avail: { Mon: ['10-18'], Tue: ['10-18'], Wed: ['10-18'], Thu: ['10-18'], Fri: ['10-18'], Sat: ['10-15'], Sun: [] },
    reviews_count: 201, rating_hist: { 5: 148, 4: 38, 3: 12, 2: 2, 1: 1 }, cancelled: 14, disputes: 3, joined: 'Mar 2022' },

  { id: 'p_rehan', name: 'Rehan Plumbing', owner: 'Rehan Khan', phone: '97118•••••', city: 'Delhi', locality: 'Janakpuri',
    cat: 'Plumber', exp: 9, lang: ['hi', 'ur'],
    bio: 'लीकेज, नल, गीज़र, मोटर — सब फ्लैट रेट पर। कोई छुपी हुई लागत नहीं।',
    rating: 4.4, jobs: 150, radius: 5, eta: 35, base: 199, hourly: 300,
    status: 'Verified', aadhaar: true, pan: false, skill_cert: false, address_proof: true, police: false,
    badges: ['Phone verified', 'Identity verified'], resp: 18, completion: 0.90, x: 22, y: 66, open: false, lat: 28.6219, lng: 77.0878,
    bank: 'PNB ••3309', payout_cycle: 'weekly',
    avail: { Mon: ['8-17'], Tue: ['8-17'], Wed: ['8-17'], Thu: ['8-17'], Fri: ['8-17'], Sat: ['8-13'], Sun: [] },
    reviews_count: 98, rating_hist: { 5: 62, 4: 24, 3: 9, 2: 2, 1: 1 }, cancelled: 11, disputes: 4, joined: 'Sep 2022' },

  { id: 'p_maya', name: 'Maya Home Salon', owner: 'Maya Devi', phone: '96201•••••', city: 'Delhi', locality: 'Punjabi Bagh',
    cat: 'Salon', exp: 14, lang: ['hi', 'en', 'pa'],
    bio: 'घर पर ही सैलून — बाल कटवाना, थ्रेडिंग, वैक्सिंग, फेशियल। बुजुर्ग और बच्चों के लिए स्पेशल रेट।',
    rating: 4.9, jobs: 611, radius: 8, eta: 60, base: 499, hourly: 0,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified', 'Top rated', 'Fast response'], resp: 4, completion: 0.98, x: 70, y: 58, open: true, lat: 28.6743, lng: 77.131,
    bank: 'Kotak ••5518', payout_cycle: 'weekly',
    avail: { Mon: ['10-20'], Tue: ['10-20'], Wed: ['10-20'], Thu: ['10-20'], Fri: ['10-20'], Sat: ['10-20'], Sun: ['12-18'] },
    reviews_count: 504, rating_hist: { 5: 442, 4: 51, 3: 9, 2: 2, 1: 0 }, cancelled: 3, disputes: 1, joined: 'Oct 2021' },

  { id: 'p_anita', name: 'Anita Deep Clean', owner: 'Anita Yadav', phone: '90012•••••', city: 'Delhi', locality: 'Paschim Vihar',
    cat: 'Deep cleaning', exp: 5, lang: ['hi'],
    bio: '3, 4, 5 BHK की डीप क्लीनिंग — बाथरूम, रसोई, सोफा शैम्पू। टीम के साथ आती हूँ।',
    rating: 4.7, jobs: 203, radius: 10, eta: 120, base: 1499, hourly: 0,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: false, address_proof: true, police: false,
    badges: ['Identity verified', 'Business verified'], resp: 9, completion: 0.96, x: 14, y: 24, open: true, lat: 28.6689, lng: 77.0937,
    bank: 'ICICI ••7723', payout_cycle: 'weekly',
    avail: { Mon: ['9-18'], Tue: ['9-18'], Wed: ['9-18'], Thu: ['9-18'], Fri: ['9-18'], Sat: ['9-16'], Sun: [] },
    reviews_count: 178, rating_hist: { 5: 135, 4: 33, 3: 8, 2: 2, 1: 0 }, cancelled: 5, disputes: 2, joined: 'Apr 2023' },

  // ── Mumbai ──
  { id: 'p_ramesh', name: 'Ramesh Electric Works', owner: 'Ramesh Patil', phone: '98200•••••', city: 'Mumbai', locality: 'Andheri West',
    cat: 'Electrician', exp: 16, lang: ['mr', 'hi', 'en'],
    bio: '16 साल — रेसिडेंशियल वायरिंग, बोर्ड चेंज, अर्थिंग। MSEDCL कॉन्ट्रैक्टर।',
    rating: 4.7, jobs: 890, radius: 8, eta: 30, base: 299, hourly: 400,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified', 'Skill certified', 'Top rated'], resp: 5, completion: 0.96, x: 42, y: 50, open: true, lat: 19.1364, lng: 72.8296,
    bank: 'Union ••6614', payout_cycle: 'weekly',
    avail: { Mon: ['8-20'], Tue: ['8-20'], Wed: ['8-20'], Thu: ['8-20'], Fri: ['8-20'], Sat: ['8-15'], Sun: [] },
    reviews_count: 710, rating_hist: { 5: 550, 4: 120, 3: 30, 2: 8, 1: 2 }, cancelled: 20, disputes: 5, joined: 'Nov 2020' },

  { id: 'p_kavita', name: 'Kavita Pest Control', owner: 'Kavita Naik', phone: '90222•••••', city: 'Mumbai', locality: 'Borivali',
    cat: 'Pest control', exp: 7, lang: ['mr', 'hi'],
    bio: 'कॉकरोच, दीमक, बेडबग — गारंटी के साथ। सरकारी सर्टिफाइड केमिकल।',
    rating: 4.5, jobs: 321, radius: 15, eta: 180, base: 899, hourly: 0,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: false,
    badges: ['Identity verified', 'Skill certified'], resp: 20, completion: 0.91, x: 28, y: 38, open: true, lat: 19.2307, lng: 72.8567,
    bank: 'SBI ••2219', payout_cycle: 'weekly',
    avail: { Tue: ['10-17'], Wed: ['10-17'], Thu: ['10-17'], Fri: ['10-17'], Sat: ['10-16'] },
    reviews_count: 240, rating_hist: { 5: 165, 4: 55, 3: 16, 2: 4, 1: 0 }, cancelled: 18, disputes: 6, joined: 'Jul 2022' },

  { id: 'p_shreya', name: 'Shreya Beauty at Home', owner: 'Shreya Kulkarni', phone: '98330•••••', city: 'Mumbai', locality: 'Dadar',
    cat: 'Salon', exp: 9, lang: ['mr', 'hi', 'en'],
    bio: 'Bridal make-up, facials, hair spa — sab ghar par. Hygiene kit har visit par naya.',
    rating: 4.8, jobs: 356, radius: 9, eta: 55, base: 599, hourly: 0,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified', 'Skill certified'], resp: 6, completion: 0.96, x: 52, y: 22, open: true, lat: 19.0178, lng: 72.8478,
    bank: 'Axis ••1180', payout_cycle: 'weekly',
    avail: { Mon: ['10-19'], Tue: ['10-19'], Wed: ['10-19'], Thu: ['10-19'], Fri: ['10-19'], Sat: ['9-20'], Sun: ['11-17'] },
    reviews_count: 290, rating_hist: { 5: 230, 4: 45, 3: 12, 2: 2, 1: 1 }, cancelled: 7, disputes: 1, joined: 'Aug 2022' },

  // ── Bengaluru ──
  { id: 'p_venkat', name: 'Venkat Appliance Care', owner: 'Venkatesh Reddy', phone: '96111•••••', city: 'Bengaluru', locality: 'HSR Layout',
    cat: 'Washing machine technician', exp: 12, lang: ['kn', 'te', 'en'],
    bio: 'All brands — Samsung, LG, Whirlpool, IFB. Spare parts guaranteed genuine.',
    rating: 4.6, jobs: 444, radius: 10, eta: 60, base: 349, hourly: 450,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified', 'Skill certified'], resp: 12, completion: 0.93, x: 55, y: 44, open: true, lat: 12.9116, lng: 77.6389,
    bank: 'Canara ••4411', payout_cycle: 'weekly',
    avail: { Mon: ['9-19'], Tue: ['9-19'], Wed: ['9-19'], Thu: ['9-19'], Fri: ['9-19'], Sat: ['9-15'], Sun: [] },
    reviews_count: 380, rating_hist: { 5: 270, 4: 85, 3: 20, 2: 4, 1: 1 }, cancelled: 16, disputes: 4, joined: 'Jun 2021' },

  { id: 'p_priya_b', name: 'Priya Home Chef', owner: 'Priya Acharya', phone: '90333•••••', city: 'Bengaluru', locality: 'Koramangala',
    cat: 'Home cook', exp: 6, lang: ['kn', 'en'],
    bio: 'South Indian, North Indian, Continental. Dinner parties up to 20 guests. FSSAI certified.',
    rating: 4.9, jobs: 189, radius: 7, eta: 90, base: 799, hourly: 0,
    status: 'Verified', aadhaar: true, pan: false, skill_cert: true, address_proof: true, police: false,
    badges: ['Identity verified', 'Skill certified', 'Fast response'], resp: 7, completion: 0.97, x: 60, y: 60, open: false, lat: 12.9352, lng: 77.6245,
    bank: 'HDFC ••3312', payout_cycle: 'weekly',
    avail: { Wed: ['10-16'], Fri: ['10-16'], Sat: ['9-18'], Sun: ['9-18'] },
    reviews_count: 155, rating_hist: { 5: 142, 4: 11, 3: 2, 2: 0, 1: 0 }, cancelled: 4, disputes: 1, joined: 'Jan 2023' },

  { id: 'p_manju', name: 'Manjunath Plumbing Works', owner: 'Manjunath Gowda', phone: '97411•••••', city: 'Bengaluru', locality: 'Indiranagar',
    cat: 'Plumber', exp: 13, lang: ['kn', 'hi', 'en'],
    bio: 'Leaks, borewell motors, bathroom fittings, apartment maintenance contracts. Same-day service.',
    rating: 4.5, jobs: 512, radius: 9, eta: 40, base: 249, hourly: 350,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: false, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified'], resp: 10, completion: 0.92, x: 78, y: 36, open: true, lat: 12.9719, lng: 77.6412,
    bank: 'SBI ••7810', payout_cycle: 'weekly',
    avail: { Mon: ['8-19'], Tue: ['8-19'], Wed: ['8-19'], Thu: ['8-19'], Fri: ['8-19'], Sat: ['8-16'], Sun: [] },
    reviews_count: 402, rating_hist: { 5: 280, 4: 88, 3: 26, 2: 6, 1: 2 }, cancelled: 21, disputes: 5, joined: 'Feb 2021' },

  // ── Hyderabad ──
  { id: 'p_srinivas', name: 'Sri Sai Electricians', owner: 'Srinivas Murthy', phone: '97044•••••', city: 'Hyderabad', locality: 'Ameerpet',
    cat: 'Electrician', exp: 20, lang: ['te', 'hi', 'en'],
    bio: '20 years. HVAC wiring, industrial panels, home automation. Licensed contractor.',
    rating: 4.8, jobs: 1210, radius: 12, eta: 35, base: 279, hourly: 380,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified', 'Skill certified', 'Top rated'], resp: 5, completion: 0.97, x: 48, y: 55, open: true, lat: 17.4375, lng: 78.4483,
    bank: 'Andhra ••8872', payout_cycle: 'weekly',
    avail: { Mon: ['8-19'], Tue: ['8-19'], Wed: ['8-19'], Thu: ['8-19'], Fri: ['8-19'], Sat: ['8-14'], Sun: [] },
    reviews_count: 990, rating_hist: { 5: 820, 4: 130, 3: 40, 2: 15, 1: 5 }, cancelled: 30, disputes: 8, joined: 'Aug 2019' },

  { id: 'p_fatima', name: 'Fatima Tailoring', owner: 'Fatima Begum', phone: '90400•••••', city: 'Hyderabad', locality: 'Tolichowki',
    cat: 'Tailor', exp: 18, lang: ['ur', 'hi', 'te'],
    bio: 'Ladies, gents, kids — salwar, kurta, blouse, alteration. Ready in 2 days.',
    rating: 4.7, jobs: 602, radius: 4, eta: 0, base: 199, hourly: 0,
    status: 'Verified', aadhaar: true, pan: false, skill_cert: false, address_proof: true, police: false,
    badges: ['Identity verified', 'Fast response'], resp: 3, completion: 0.95, x: 35, y: 65, open: true, lat: 17.4009, lng: 78.4026,
    bank: 'SBI ••9901', payout_cycle: 'weekly',
    avail: { Mon: ['9-20'], Tue: ['9-20'], Wed: ['9-20'], Thu: ['9-20'], Fri: ['9-20'], Sat: ['9-18'], Sun: [] },
    reviews_count: 511, rating_hist: { 5: 420, 4: 70, 3: 18, 2: 2, 1: 1 }, cancelled: 6, disputes: 2, joined: 'May 2020' },

  // ── Kolkata ──
  { id: 'p_debraj', name: 'Debraj AC & Appliance', owner: 'Debraj Bose', phone: '98300•••••', city: 'Kolkata', locality: 'Salt Lake',
    cat: 'AC technician', exp: 10, lang: ['bn', 'hi', 'en'],
    bio: 'AC installation, servicing, gas. Also fridge and washing machine. Kolkata summers sorted.',
    rating: 4.5, jobs: 315, radius: 10, eta: 50, base: 449, hourly: 500,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: false,
    badges: ['Identity verified', 'Skill certified'], resp: 14, completion: 0.92, x: 62, y: 48, open: true, lat: 22.5867, lng: 88.4171,
    bank: 'UCO ••6611', payout_cycle: 'weekly',
    avail: { Mon: ['10-18'], Tue: ['10-18'], Wed: ['10-18'], Thu: ['10-18'], Fri: ['10-18'], Sat: ['10-15'], Sun: [] },
    reviews_count: 260, rating_hist: { 5: 185, 4: 55, 3: 15, 2: 4, 1: 1 }, cancelled: 20, disputes: 5, joined: 'Feb 2022' },

  { id: 'p_arup', name: 'Arup Electric Service', owner: 'Arup Mondal', phone: '90070•••••', city: 'Kolkata', locality: 'Behala',
    cat: 'Electrician', exp: 14, lang: ['bn', 'hi'],
    bio: 'ওয়্যারিং, ইনভার্টার, মিটার বোর্ড — বাড়ি ও দোকানের সব কাজ। CESC অভিজ্ঞতা।',
    rating: 4.6, jobs: 478, radius: 8, eta: 30, base: 229, hourly: 320,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: false, address_proof: true, police: true,
    badges: ['Identity verified', 'Police verified'], resp: 8, completion: 0.94, x: 18, y: 78, open: true, lat: 22.4989, lng: 88.3105,
    bank: 'BOI ••5527', payout_cycle: 'weekly',
    avail: { Mon: ['9-18'], Tue: ['9-18'], Wed: ['9-18'], Thu: ['9-18'], Fri: ['9-18'], Sat: ['9-14'], Sun: [] },
    reviews_count: 361, rating_hist: { 5: 262, 4: 70, 3: 22, 2: 5, 1: 2 }, cancelled: 13, disputes: 3, joined: 'Dec 2021' },

  // ── Pune ──
  { id: 'p_yogesh', name: 'Yogesh Handyman', owner: 'Yogesh Salunke', phone: '91722•••••', city: 'Pune', locality: 'Baner',
    cat: 'Handyman', exp: 6, lang: ['mr', 'hi'],
    bio: 'Furniture assembly, wall fix, geyser fitting, door lock — small jobs done right.',
    rating: 4.6, jobs: 228, radius: 8, eta: 45, base: 249, hourly: 320,
    status: 'Under verification', aadhaar: true, pan: true, skill_cert: false, address_proof: true, police: false,
    badges: ['Identity verified'], resp: 16, completion: 0.89, x: 45, y: 35, open: true, lat: 18.559, lng: 73.7868,
    bank: 'Maharashtra ••2241', payout_cycle: 'weekly',
    avail: { Mon: ['9-18'], Tue: ['9-18'], Wed: ['9-18'], Thu: ['9-18'], Fri: ['9-18'], Sat: ['9-15'], Sun: [] },
    reviews_count: 181, rating_hist: { 5: 128, 4: 38, 3: 10, 2: 4, 1: 1 }, cancelled: 19, disputes: 7, joined: 'Oct 2023' },

  { id: 'p_tanvir', name: 'Tanvir Laptop Clinic', owner: 'Tanvir Shaikh', phone: '95455•••••', city: 'Pune', locality: 'Kothrud',
    cat: 'Laptop repair', exp: 8, lang: ['mr', 'hi', 'en'],
    bio: 'Screen, battery, keyboard, data recovery — doorstep pickup and drop. 90-day warranty on parts.',
    rating: 4.7, jobs: 341, radius: 12, eta: 90, base: 299, hourly: 0,
    status: 'Verified', aadhaar: true, pan: true, skill_cert: true, address_proof: true, police: false,
    badges: ['Identity verified', 'Skill certified'], resp: 9, completion: 0.95, x: 82, y: 70, open: true, lat: 18.5074, lng: 73.8077,
    bank: 'IDFC ••9016', payout_cycle: 'weekly',
    avail: { Mon: ['10-19'], Tue: ['10-19'], Wed: ['10-19'], Thu: ['10-19'], Fri: ['10-19'], Sat: ['10-17'], Sun: [] },
    reviews_count: 265, rating_hist: { 5: 198, 4: 50, 3: 13, 2: 3, 1: 1 }, cancelled: 9, disputes: 2, joined: 'May 2022' },

  { id: 'p_seema', name: 'Seema Deep Clean Pune', owner: 'Seema Pawar', phone: '98905•••••', city: 'Pune', locality: 'Viman Nagar',
    cat: 'Deep cleaning', exp: 4, lang: ['mr', 'hi'],
    bio: 'Kitchen degrease, bathroom descale, sofa and mattress shampoo. Team of 3, own equipment.',
    rating: 4.4, jobs: 132, radius: 11, eta: 150, base: 1299, hourly: 0,
    status: 'Verified', aadhaar: true, pan: false, skill_cert: false, address_proof: true, police: false,
    badges: ['Identity verified'], resp: 15, completion: 0.9, x: 66, y: 16, open: true, lat: 18.5679, lng: 73.9143,
    bank: 'HDFC ••2287', payout_cycle: 'weekly',
    avail: { Tue: ['9-17'], Wed: ['9-17'], Thu: ['9-17'], Fri: ['9-17'], Sat: ['9-17'], Sun: ['10-15'] },
    reviews_count: 104, rating_hist: { 5: 70, 4: 24, 3: 7, 2: 2, 1: 1 }, cancelled: 8, disputes: 3, joined: 'Jan 2024' },
];

const AGENTS: Agent[] = [
  { id: 'a_iqbal', name: 'Iqbal Ahmed', phone: '91522•••••', city: 'Lucknow', lang: ['hi', 'en'], online: true,
    skills: ['Train booking', 'Bus booking', 'Government forms', 'IRCTC', 'DigiLocker'],
    cat: 'Travel & Government',
    bio: 'IRCTC में 9 साल से booking करता हूँ। सरकारी फॉर्म, DigiLocker, passport — सब कर चुका हूँ।',
    rating: 4.7, done: 318, cancel: 14, dispute: 8, sla: '92% within SLA', resp_min: 4,
    earnings: 18420, pending: 960, wk_earnings: 1840,
    verified: true, aadhaar: true, pan: true, skill_test: 'passed', bg_check: 'passed',
    joined: 'Mar 2022', level: 'Senior', status: 'Active' },

  { id: 'a_priya', name: 'Priya Nair', phone: '98411•••••', city: 'Bengaluru', lang: ['ml', 'en', 'hi'], online: false,
    skills: ['Email drafting', 'Research', 'Document summary', 'Translation', 'Form filling'],
    cat: 'Documents & Communication',
    bio: 'English and Malayalam writing, research, form assistance. Former bank officer.',
    rating: 4.9, done: 502, cancel: 6, dispute: 3, sla: '96% within SLA', resp_min: 6,
    earnings: 31100, pending: 0, wk_earnings: 2800,
    verified: true, aadhaar: true, pan: true, skill_test: 'passed', bg_check: 'passed',
    joined: 'Jan 2022', level: 'Senior', status: 'Active' },

  { id: 'a_mohan', name: 'Mohan Sharma', phone: '97801•••••', city: 'Jaipur', lang: ['hi', 'en'], online: true,
    skills: ['Appointment booking', 'Hospital registration', 'Lab test booking', 'Specialist referral'],
    cat: 'Healthcare admin',
    bio: 'Doctor appointments, online lab booking, hospital registration. Apollo, Fortis, Max empanelled.',
    rating: 4.5, done: 144, cancel: 18, dispute: 10, sla: '84% within SLA', resp_min: 8,
    earnings: 8640, pending: 480, wk_earnings: 960,
    verified: true, aadhaar: true, pan: true, skill_test: 'passed', bg_check: 'passed',
    joined: 'Sep 2023', level: 'Standard', status: 'Active' },

  { id: 'a_savita', name: 'Savita Patel', phone: '90900•••••', city: 'Ahmedabad', lang: ['gu', 'hi', 'en'], online: true,
    skills: ['Shopping research', 'Product comparison', 'Online ordering', 'Returns'],
    cat: 'Shopping & E-commerce',
    bio: 'Product research, best price, ordering on Amazon/Flipkart, return tracking. Gujarati and Hindi.',
    rating: 4.4, done: 89, cancel: 12, dispute: 5, sla: '80% within SLA', resp_min: 10,
    earnings: 5340, pending: 240, wk_earnings: 540,
    verified: true, aadhaar: true, pan: false, skill_test: 'passed', bg_check: 'pending',
    joined: 'Feb 2024', level: 'New', status: 'Active' },

  { id: 'a_kiran', name: 'Kiran Reddy', phone: '96501•••••', city: 'Hyderabad', lang: ['te', 'en', 'hi'], online: true,
    skills: ['GST filing help', 'Business registration', 'Shop license', 'UDYAM registration'],
    cat: 'Business & Government',
    bio: 'Udyam, MSME, GST registration, shop licence. Telugu medium available.',
    rating: 4.6, done: 203, cancel: 9, dispute: 4, sla: '89% within SLA', resp_min: 6,
    earnings: 14200, pending: 600, wk_earnings: 1420,
    verified: true, aadhaar: true, pan: true, skill_test: 'passed', bg_check: 'passed',
    joined: 'Jun 2022', level: 'Senior', status: 'Active' },

  { id: 'a_meena', name: 'Meena Kumari', phone: '99003•••••', city: 'Delhi', lang: ['hi', 'en'], online: false,
    skills: ['Ration card', 'Water connection', 'Birth certificate', 'Death certificate', 'Property tax'],
    cat: 'Municipal & Local government',
    bio: 'MCD, DJB, ration card — offline government work that the AI cannot do. 8 years experience.',
    rating: 4.8, done: 441, cancel: 7, dispute: 3, sla: '94% within SLA', resp_min: 5,
    earnings: 26460, pending: 360, wk_earnings: 2640,
    verified: true, aadhaar: true, pan: true, skill_test: 'passed', bg_check: 'passed',
    joined: 'Apr 2021', level: 'Senior', status: 'Active' },
];

const DOCUMENTS: Doc[] = [
  { id: 'd_rent', userId: 'u_asha', name: 'Rent agreement 2026.pdf', cat: 'Property', size: '480 KB', added: daysAgo(20), expiry: '2027-03-31',
    summary: '11-month rent agreement, ₹18,000/month, 2-month deposit, notice period 1 month.' },
  { id: 'd_health', userId: 'u_asha', name: 'Health policy — Star.pdf', cat: 'Insurance', size: '1.2 MB', added: daysAgo(60), expiry: '2026-11-14',
    summary: 'Family floater ₹5 lakh. Renewal due 14 Nov 2026. Room rent capped at 1% of sum insured.' },
  { id: 'd_pension', userId: 'u_ram', name: 'Pension slip Aug.pdf', cat: 'Finance', size: '210 KB', added: daysAgo(8), expiry: '',
    summary: 'Monthly pension credit statement for August.' },
];

function seedHistory(db: DBShape) {
  const mk = (o: Partial<Task> & { at: string; user_id: string; intent: string; category: string; description: string; status: Task['status'] }): Task => {
    const t: Task = {
      task_id: uid('t'), subcategory: '', priority: 'Normal',
      estimated_cost: 0, platform_cost: 0, user_price: 0, credits_required: 0,
      assigned_agent: null, assigned_provider: null, risk_level: 'low',
      requires_confirmation: false, confirmation_status: 'not required',
      created_at: o.at, updated_at: o.at,
      completed_at: o.status === 'Completed' ? o.at : null,
      result: null, attachments: [], audit_log: [], steps: [], data: {},
      ...o,
    } as Task;
    t.audit_log.push({ at: o.at, by: o.user_id, action: 'Task created', detail: 'Seeded demo history' });
    if (o.status === 'Completed') t.audit_log.push({ at: o.at, by: 'system', action: 'Status → Completed', detail: (o as { result?: string }).result || '' });
    return t;
  };
  db.tasks = [
    mk({ user_id: 'u_asha', category: 'bills', intent: 'bill', description: 'Pay August electricity bill', status: 'Completed', risk_level: 'high', credits_required: 2, user_price: 1284, result: 'Paid ₹1,284 to BSES Rajdhani. Receipt saved.', at: daysAgo(3), data: { phase: 'done', result: 'Paid ₹1,284 to BSES Rajdhani. Receipt saved.', title: 'Bill payment' } }),
    mk({ user_id: 'u_asha', category: 'docs', intent: 'doc', description: 'Explain my rent agreement in simple Hindi', status: 'Completed', risk_level: 'low', credits_required: 3, result: '11-month agreement, ₹18,000/month, 1-month notice.', at: daysAgo(6), data: { phase: 'done', result: '11-month agreement, ₹18,000/month, 1-month notice.', title: 'Document help' } }),
    mk({ user_id: 'u_ram', category: 'telecom', intent: 'recharge', description: 'BSNL recharge for my number', status: 'Completed', risk_level: 'high', credits_required: 2, user_price: 199, result: '₹199 recharge done. Valid 28 days.', at: daysAgo(9), data: { phase: 'done', result: '₹199 recharge done. Valid 28 days.', title: 'Mobile recharge' } }),
    mk({ user_id: 'u_nidhi', category: 'travel', intent: 'train', description: 'Delhi to Mumbai train for Papa, lower berth', status: 'Escalated to human', risk_level: 'medium', credits_required: 5, assigned_agent: 'a_iqbal', at: daysAgo(1), data: { phase: 'tracking', title: 'Travel search', track: { kind: 'agent', stage: 'working', startedAt: Date.now(), mock: false } } }),
    mk({ user_id: 'u_ram', category: 'physical', intent: 'local', description: 'Fan not working, need an electrician', status: 'Assigned to local provider', risk_level: 'medium', credits_required: 8, assigned_provider: 'p_suresh', user_price: 249, at: daysAgo(0), data: { phase: 'tracking', title: 'Local service', pick: 'p_suresh', track: { kind: 'provider', stage: 'accepted', startedAt: Date.now(), mock: false } } }),
  ];
  db.bookings = [
    { id: uid('b'), taskId: db.tasks[4].task_id, userId: 'u_ram', providerId: 'p_suresh', cat: 'Electrician', when: 'Today, 4:00–5:00 PM', status: 'Accepted', price: 249, address: '12/8 Civil Lines, Kanpur' },
    { id: uid('b'), taskId: null, userId: 'u_asha', providerId: 'p_maya', cat: 'Salon', when: 'Sat, 11:00 AM', status: 'Requested', price: 499, address: 'B-42, Rajouri Garden, Delhi' },
  ] as Booking[];
  db.reviews = [
    { id: uid('r'), userId: 'u_asha', providerId: 'p_suresh', stars: 5, text: 'Came on time, fixed the switchboard in 20 minutes.', at: daysAgo(12) },
    { id: uid('r'), userId: 'u_nidhi', providerId: 'p_maya', stars: 5, text: 'Very professional. Papa was comfortable.', at: daysAgo(18) },
  ];
  db.notifications = [
    { id: uid('n'), userId: 'u_asha', title: 'Your plan expires tomorrow', body: 'Jio plan on 98•••• ••210 ends 8 Sep. Recharge now?', kind: 'warn', at: daysAgo(0), read: false },
    { id: uid('n'), userId: 'u_ram', title: 'Electrician arriving in 20 minutes', body: 'Suresh Electricals is on the way for the fan repair.', kind: 'info', at: daysAgo(0), read: false },
    { id: uid('n'), userId: 'u_nidhi', title: 'Approval needed', body: 'Papa requested a train booking of ₹2,310. Approve?', kind: 'warn', at: daysAgo(0), read: false },
  ];
  db.disputes = [
    { id: uid('dp'), userId: 'u_asha', taskId: db.tasks[0].task_id, type: 'Payment issue', text: 'Charged twice for the same bill.', status: 'Open', at: daysAgo(2) },
  ];
}

export function SEED(): DBShape {
  const db: DBShape = {
    config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
    users: JSON.parse(JSON.stringify(USERS)),
    family: [
      { id: uid('fm'), ownerId: 'u_nidhi', name: 'Papa (Ram Prasad)', relation: 'Father', phone: '99•••• ••118', linkedUserId: 'u_ram',
        perms: { view: true, create: true, notify: true, approve: false, docs: true, history: true } },
      { id: uid('fm'), ownerId: 'u_nidhi', name: 'Mummy (Sunita)', relation: 'Mother', phone: '99•••• ••119',
        perms: { view: true, create: false, notify: true, approve: false, docs: false, history: true } },
    ],
    providers: JSON.parse(JSON.stringify(PROVIDERS)),
    agents: JSON.parse(JSON.stringify(AGENTS)),
    tasks: [], bookings: [], documents: JSON.parse(JSON.stringify(DOCUMENTS)),
    notifications: [], reviews: [], disputes: [], ledger: [], events: [],
    threads: {}, reminders: [], ui: {}, session: null, seededAt: now(), mode: 'demo',
  };
  seedHistory(db);
  return db;
}

/* Real-user seed: completely clean. No fabricated customers, providers,
   agents, tasks, documents or reviews — real partners and agents enter
   through the application funnels and admin verification. Signed-in users
   start with a private, empty slate. */
export function REAL_SEED(): DBShape {
  return {
    config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
    users: [],
    family: [],
    providers: [],
    agents: [],
    tasks: [], bookings: [], documents: [],
    notifications: [], reviews: [], disputes: [], ledger: [], events: [],
    threads: {}, reminders: [], ui: {}, session: null, seededAt: now(), mode: 'real',
  };
}
