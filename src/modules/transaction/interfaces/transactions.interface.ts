export interface Transaction {
  reference: string;
  from_wallet_id: string | null;
  to_wallet_id: string | null;
  amount: number;
  type: string;
  meta: string;
  created_at: Date;
  updated_at: Date;
}
