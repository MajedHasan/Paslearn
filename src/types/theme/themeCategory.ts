export interface ThemeCategory {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCategoryFormValues {
  name: string;
  slug: string;
}