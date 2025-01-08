/*
  # Add birthdate to patients table

  1. Changes
    - Add birthdate column to patients table
*/

ALTER TABLE patients ADD COLUMN IF NOT EXISTS birthdate date NOT NULL;