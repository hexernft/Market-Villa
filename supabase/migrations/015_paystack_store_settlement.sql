alter table public.businesses
add column if not exists paystack_subaccount_code text,
add column if not exists settlement_bank_code text,
add column if not exists settlement_account_number text,
add column if not exists settlement_account_name text,
add column if not exists settlement_status text not null default 'not_configured',
add column if not exists settlement_note text;

alter table public.orders
add column if not exists payment_reference text,
add column if not exists payment_status text not null default 'unpaid',
add column if not exists payment_channel text,
add column if not exists paid_at timestamptz,
add column if not exists paystack_subaccount_code text,
add column if not exists platform_fee_percent numeric(5, 2),
add column if not exists platform_fee_amount numeric(12, 2),
add column if not exists owner_settlement_amount numeric(12, 2),
add column if not exists payment_raw_response jsonb;

create unique index if not exists orders_payment_reference_idx
on public.orders (payment_reference)
where payment_reference is not null;

create index if not exists businesses_paystack_subaccount_code_idx
on public.businesses (paystack_subaccount_code);
