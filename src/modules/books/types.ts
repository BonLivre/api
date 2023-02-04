import { Author, Book, Genre } from "@prisma/client";

export type BookWithAuthorsAndGenres = Book & {
  authors: Author[];
  genres: Genre[];
};

export type BooksWithAuthorsAndGenres = BookWithAuthorsAndGenres[];
