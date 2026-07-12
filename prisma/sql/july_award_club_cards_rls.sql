ALTER TABLE IF EXISTS public.july_award_club_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS july_award_club_cards_no_public_access ON public.july_award_club_cards;
CREATE POLICY july_award_club_cards_no_public_access
ON public.july_award_club_cards
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
