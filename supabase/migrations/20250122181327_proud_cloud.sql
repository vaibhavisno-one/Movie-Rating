/*
  # Initial Schema Setup for Movie Rating Website

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - username (text)
      - avatar_url (text)
      - created_at (timestamp)
    
    - movies
      - id (uuid, primary key)
      - tmdb_id (integer)
      - title (text)
      - poster_path (text)
      - release_date (date)
      - created_at (timestamp)
    
    - ratings
      - id (uuid, primary key)
      - movie_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - rating (integer)
      - review (text)
      - intimacy_rating (text)
      - created_at (timestamp)
    
    - favorites
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - movie_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer UNIQUE NOT NULL,
  title text NOT NULL,
  poster_path text,
  release_date date,
  created_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 10),
  review text,
  intimacy_rating text CHECK (intimacy_rating IN ('Little', 'Some', 'Very Much', 'Most')),
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Movies policies
CREATE POLICY "Movies are viewable by everyone"
  ON movies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert movies"
  ON movies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Favorites are viewable by owner"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage their favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);