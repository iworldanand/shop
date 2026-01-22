
import { PromptDatabase } from './types';

export const COLORS = {
  brand: '#f59e0b',
  tech: '#3b82f6',
  accent: '#ef4444',
  success: '#10b981',
  dark: '#1f2937'
};

export const AUTH_PASSWORD = 'vfx@123';

export const DAILY_LIMITS = {
  IMAGE: 5,
  VIDEO: 5
};

export const CATEGORIES = [
  "Grand Opening", "Jewellery", "Textiles", "Electronics", "Hotels & Food", 
  "Supermarket", "Real Estate", "Gym & Fitness", "Beauty Parlour", 
  "Education", "Tours & Travels", "Festival Offers", "Creative Posters", 
  "Laptop Offers", "Mobile Deals", "Home Appliances"
];

export const TAMIL_MAP: Record<string, string> = {
  'vanakkam': 'வணக்கம்',
  'shop': 'கடை',
  'sale': 'விற்பனை',
  'offer': 'சலுகை',
  'discount': 'தள்ளுபடி',
  'price': 'விலை',
  'free': 'இலவச',
  'gift': 'பரிசு',
  'laptop': 'லேப்டாப்',
  'electronics': 'மின்னணு',
  'sathya': 'சத்திய',
  'opening': 'திறப்பு விழா',
  'grand': 'பெரிய',
  'festival': 'திருவிழா',
  'chennai': 'சென்னை'
};

export const PROMPTS_DATABASE: PromptDatabase = {
  'Grand Opening': [
    {
      id: 1,
      titleEnglish: "Grand Opening Celebration",
      titleTamil: "பெரிய திறப்பு விழா",
      imagePrompt: "Cinematic wide shot of [SHOP_NAME] grand opening with a red ribbon cutting ceremony, golden scissors, balloons floating in the air, crowd cheering with confetti, ultra realistic lighting, Pixar style 3D render, vibrant colors, 8K resolution, [ASPECT_RATIO]",
      videoPrompt: "Cinematic opening shot of [SHOP_NAME] exterior at dusk, lights turning on one by one, zoom into ribbon cutting ceremony with shop owner smiling, confetti explosion in slow motion, customers entering the store, dynamic camera movements, 4K cinematic video"
    },
    {
      id: 2,
      titleEnglish: "Modern Store Launch",
      titleTamil: "நவீன கடை தொடக்கம்",
      imagePrompt: "Ultra modern [SHOP_NAME] store launch with glass facade, neon sign lighting up, sophisticated customers browsing [PRODUCT], minimalist interior design, futuristic aesthetic, Pixar 3D style, cinematic lighting, depth of field, [ASPECT_RATIO]",
      videoPrompt: "Time-lapse of [SHOP_NAME] store preparation leading to opening, lights turning on, first customers entering, dynamic tracking shots through aisles, upbeat background music, smooth transitions"
    }
  ],
  'Electronics': [
    {
      id: 6,
      titleEnglish: "Laptop Festival Sale",
      titleTamil: "லேப்டாப் திருவிழா விற்பனை",
      imagePrompt: "Professional promotional poster for [SHOP_NAME] laptop sale with [OFFER], [PRODUCT] arranged beautifully with RGB lighting, modern tech aesthetic, bold typography showing [OFFER_PRICE], free gifts like [FREE_GIFTS], colorful background, 3D render, aspect ratio [ASPECT_RATIO]",
      videoPrompt: "Tech commercial for [SHOP_NAME] laptop sale, rotating shots of laptops with RGB lighting, close-ups of features, text animations showing [OFFER] and [OFFER_PRICE], free gifts reveal, upbeat tech music"
    },
    {
      id: 7,
      titleEnglish: "RGB Speaker Promotion",
      titleTamil: "ஆர்ஜிபி ஸ்பீக்கர் விளம்பரம்",
      imagePrompt: "Dynamic promotional image of RGB light speaker for [SHOP_NAME], colorful LED lights glowing in dark room, sound waves visible, modern gaming setup, [OFFER] text overlay, tech aesthetic, Pixar 3D style, [ASPECT_RATIO]",
      videoPrompt: "RGB speaker promotional video showing color patterns syncing with music, close-ups of LED lights, sound visualization effects, [OFFER] text animations, product features highlighted"
    }
  ],
  'Festival Offers': [
    {
      id: 11,
      titleEnglish: "Pongal Special Offers",
      titleTamil: "பொங்கல் சிறப்பு சலுகைகள்",
      imagePrompt: "Festive Pongal promotional poster for [SHOP_NAME] with traditional pot boiling over, sugarcane decorations, kolam patterns, [PRODUCT] displayed with [OFFER] tags, warm festive colors, cultural elements, Pixar 3D style, [ASPECT_RATIO]",
      videoPrompt: "Pongal festival commercial for [SHOP_NAME], traditional celebrations mixed with modern shopping, family buying [PRODUCT], [OFFER] text animations, festive decorations"
    }
  ]
};

// Fill missing categories to satisfy the replica requirement (simulated)
CATEGORIES.forEach(cat => {
  if (!PROMPTS_DATABASE[cat]) {
    PROMPTS_DATABASE[cat] = [
      {
        id: Math.random() * 1000,
        titleEnglish: `${cat} Promo`,
        titleTamil: `${cat} விளம்பரம்`,
        imagePrompt: `Cinematic/Pixar 3D style for [SHOP_NAME] in ${cat} category using [PRODUCT] with [OFFER]. [ASPECT_RATIO]`,
        videoPrompt: `Commercial video for [SHOP_NAME] ${cat} featuring [PRODUCT], highlighting [OFFER_PRICE] and [FREE_GIFTS].`
      }
    ];
  }
});
