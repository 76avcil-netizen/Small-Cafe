// TODO: Generate this file with Supabase CLI once the remote schema is finalized:
// npx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type LooseRow = {
  [key: string]: any;
};

interface LooseTable {
  Row: LooseRow;
  Insert: LooseRow;
  Update: LooseRow;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      restaurants: LooseTable;
      profiles: LooseTable;
      categories: LooseTable;
      products: LooseTable;
      orders: LooseTable;
      order_items: LooseTable;
      tables: LooseTable;
      expenses: LooseTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
