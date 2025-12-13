import type { Document } from "mongoose"

export type Gender = "man" | "women" | "kids"
export type Category = "shoe" | "sandals" | "slippers"
export type Quality = "Fresh" | "Second"

export interface Products {
  _id?: string
  name: string
  gender: Gender
  category: Category
  subcategory: string
  images: string[]
  stock: number
  sizes: string
  description: string
  price: number // ISO Date string format
  otherDesignImg: string[]
  quality: Quality
  
}

export interface ProductFormData {
  name: string;
  gender: string;
  category: string;
  subcategory: string;
  stock: number;
  sizes: string;
  description: string;
  price: number;
  quality: string;
  images: string[];
  otherDesignImg: string[];
}

