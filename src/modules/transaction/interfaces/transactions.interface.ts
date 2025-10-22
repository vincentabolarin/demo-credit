export interface Transaction {
  id: string;
  reference: string;
  from_wallet_id: string | null;
  to_wallet_id: string | null;
  from_user_id: string | null;
  to_user_id: string | null;
  amount: number;
  type: 'FUNDING' | 'WITHDRAWAL' | 'TRANSFER';
  meta: string;
  created_at: Date;
  updated_at: Date;
}

export interface FlatTransactionWithUsers {
  // Properties from the 'transactions' table
  id: string;
  reference: string;
  from_wallet_id: string | null;
  to_wallet_id: string | null;
  from_user_id: string | null;
  to_user_id: string | null;
  amount: number;
  type: 'FUNDING' | 'WITHDRAWAL' | 'TRANSFER';
  meta: string;
  created_at: Date;
  updated_at: Date;

  // Aliased properties from the 'from_user' join
  from_user_first_name: string | null;
  from_user_last_name: string | null;
  from_user_email: string | null;

  // Aliased properties from the 'to_user' join
  to_user_first_name: string | null;
  to_user_last_name: string | null;
  to_user_email: string | null;
}

export interface TransactionUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}
