-- PostgreSQL schema for Society Maintenance System (with Better-Auth)
-- Note: This integrates with existing user, account, session, and verification tables from better-auth
-- Better-auth handles authentication through sessions, not database RLS

-- Create enum for interval types
CREATE TYPE public.interval_type AS ENUM ('monthly', 'quarterly', 'half_yearly', 'annually');

-- Table: payment_categories
CREATE TABLE public.payment_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Table: expense_categories
CREATE TABLE public.expense_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Table: payments (references existing user table)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public."user"(id),
    category_id INTEGER NOT NULL REFERENCES public.payment_categories(id),
    amount NUMERIC(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    period_start DATE,
    period_end DATE,
    interval_type public.interval_type,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: society_funds (auto-updated via triggers)
CREATE TABLE public.society_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_funds NUMERIC(14,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Table: expenses
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER NOT NULL REFERENCES public.expense_categories(id),
    amount NUMERIC(10,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


-- Trigger function to update society_funds on payment
CREATE OR REPLACE FUNCTION public.update_society_funds_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure society_funds record exists
    INSERT INTO public.society_funds (total_funds) 
    SELECT 0 
    WHERE NOT EXISTS (SELECT 1 FROM public.society_funds LIMIT 1);
    
    UPDATE public.society_funds
    SET total_funds = total_funds + NEW.amount,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update society_funds on expense
CREATE OR REPLACE FUNCTION public.update_society_funds_on_expense()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure society_funds record exists
    INSERT INTO public.society_funds (total_funds) 
    SELECT 0 
    WHERE NOT EXISTS (SELECT 1 FROM public.society_funds LIMIT 1);
    
    UPDATE public.society_funds
    SET total_funds = total_funds - NEW.amount,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_update_funds_after_payment
    AFTER INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_society_funds_on_payment();

CREATE TRIGGER trg_update_funds_after_expense
    AFTER INSERT ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_society_funds_on_expense();


-- Create indexes for better performance
CREATE INDEX idx_payment_categories_name ON public.payment_categories(name);
CREATE INDEX idx_expense_categories_name ON public.expense_categories(name);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_category_id ON public.payments(category_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_payments_period_start ON public.payments(period_start);
CREATE INDEX idx_payments_period_end ON public.payments(period_end);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);

-- Insert default payment categories
INSERT INTO public.payment_categories (name, description) VALUES
    ('maintenance', 'Monthly maintenance fees'),
    ('collection', 'Immediate collection fees'),
    ('misc', 'Miscellaneous payments');

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
    ('salary', 'Worker salaries and wages'),
    ('bill', 'Electricity and water bills and charges'),
    ('administration', 'Administrative expenses'),
    ('misc', 'Miscellaneous expenses');

-- Function to get member payment total (similar to existing function in types.ts)
CREATE OR REPLACE FUNCTION public.get_member_payment_total(member_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) FROM public.payments WHERE user_id = member_uuid),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get current society balance
CREATE OR REPLACE FUNCTION public.get_society_balance()
RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(
        (SELECT total_funds FROM public.society_funds ORDER BY last_updated DESC LIMIT 1),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly payment summary
CREATE OR REPLACE FUNCTION public.get_monthly_payment_summary(target_year INTEGER, target_month INTEGER)
RETURNS TABLE(
    total_payments NUMERIC,
    payment_count BIGINT,
    avg_payment NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(amount), 0) as total_payments,
        COUNT(*) as payment_count,
        COALESCE(AVG(amount), 0) as avg_payment
    FROM public.payments 
    WHERE EXTRACT(YEAR FROM payment_date) = target_year 
      AND EXTRACT(MONTH FROM payment_date) = target_month;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly expense summary
CREATE OR REPLACE FUNCTION public.get_monthly_expense_summary(target_year INTEGER, target_month INTEGER)
RETURNS TABLE(
    total_expenses NUMERIC,
    expense_count BIGINT,
    avg_expense NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as expense_count,
        COALESCE(AVG(amount), 0) as avg_expense
    FROM public.expenses 
    WHERE EXTRACT(YEAR FROM expense_date) = target_year 
      AND EXTRACT(MONTH FROM expense_date) = target_month;
END;
$$ LANGUAGE plpgsql;
