export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
  [key: string]: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  [key: string]: string;
}

export interface ThemeGlobalStyles {
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: string;
  spacing: string;
  customCSS: string;
}

export interface Theme {
  _id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  category?: {
    _id: string;
    name: string;
  };
  tags: string[];
  isActive: boolean;
  sortOrder: number;
  globalStyles: ThemeGlobalStyles;
  pages: {
    _id: string;
    name: string;
    type: string;
    content?: any;
  }[];
  modules: {
    _id: string;
    type: string;
    key: string;
    label: string;
    config?: any;
  }[];
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeFormValues {
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  isActive: boolean;
  sortOrder: number;
  globalStyles: ThemeGlobalStyles;
  pages: string[];      // ObjectIds
  modules: string[];    // ObjectIds
  version: string;
  author: string;
}