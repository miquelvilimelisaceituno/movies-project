export interface Page<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

export interface MovieSummary extends Movie {
  genre_ids: number[];
}

export interface PersonSummary {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface CastMember extends PersonSummary {
  character: string;
  order: number;
  credit_id: string;
}

export interface CrewMember extends PersonSummary {
  department: string;
  job: string;
  credit_id: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
  credits: { cast: CastMember[]; crew: CrewMember[] };
  videos: { results: Video[] };
}

export interface PersonDetails extends PersonSummary {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  movie_credits: {
    cast: (MovieSummary & { character: string; credit_id: string })[];
    crew: (MovieSummary & { job: string; department: string; credit_id: string })[];
  };
}

export interface Keyword {
  id: number;
  name: string;
}

export interface SearchQuery {
  query: string;
  page?: number;
}

export interface DiscoverFilters {
  page?: number;
  with_genres?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  primary_release_year?: number;
  with_keywords?: string;
  with_cast?: string;
  sort_by?:
    | 'popularity.desc'
    | 'popularity.asc'
    | 'vote_average.desc'
    | 'vote_average.asc'
    | 'primary_release_date.desc'
    | 'primary_release_date.asc';
}
