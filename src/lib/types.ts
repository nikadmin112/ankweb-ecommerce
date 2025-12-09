export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          badge: string | null;
          image: string | null;
          category: string | null;
          full_description: string | null;
          features: string[] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          badge?: string | null;
          image?: string | null;
          category?: string | null;
          full_description?: string | null;
          features?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          badge?: string | null;
          image?: string | null;
          category?: string | null;
          full_description?: string | null;
          features?: string[] | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          is_guest: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          is_guest?: boolean;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total: number;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          total: number;
          status?: string;
        };
        Update: {
          status?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Update: never;
      };
    };
    Views: never;
    Functions: never;
    Enums: never;
  };
};
