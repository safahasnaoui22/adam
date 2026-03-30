-- Add bonus stars columns to Restaurant table
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "googleMapsBonusStars" INTEGER DEFAULT 50;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "facebookBonusStars" INTEGER DEFAULT 50;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "instagramBonusStars" INTEGER DEFAULT 50;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "twitterBonusStars" INTEGER DEFAULT 50;