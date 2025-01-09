/*
  # Enhance dentist profile

  1. New Columns
    - Add photo_url for dentist profile picture
    - Add birthdate for dentist date of birth

  2. Changes
    - Update social_media structure to support dynamic platforms
*/

ALTER TABLE dentists 
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS birthdate date;