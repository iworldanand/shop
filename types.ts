
export interface PromotionDetails {
  shopName: string;
  product: string;
  offer: string;
  location: string;
  theme: string;
  eventDate: string;
  offerPrice: string;
  freeGifts: string;
  additionalOffer: string;
  aspectRatio: string;
  posterStyle: string;
}

export interface PromptTemplate {
  id: number;
  titleEnglish: string;
  titleTamil: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface PromptDatabase {
  [category: string]: PromptTemplate[];
}

export type PosterStyleType = 'Bold Offer' | 'Free Gift' | 'Minimalist' | 'Festival' | 'Luxury';
