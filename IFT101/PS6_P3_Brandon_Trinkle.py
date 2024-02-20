'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS6
Problem: P3
Date: 11/17/2023
'''

class Author:
    all_authors = []

    def __init__(self, name, dob, nationality):
        self.name = name
        self.dob = dob
        self.nationality = nationality
        self.books = []
        self.all_authors.append(self)

    def write_book(self, title, publication_date):
        book = Book(title, self, publication_date)
        self.books.append(book)


class Book:
    all_books = []

    def __init__(self, title, author, publication_date):
        self.title = title
        self.author = author
        self.publication_date = publication_date
        self.all_books.append(self)

    def __str__(self):
        return f"Title: {self.title}, Author: {self.author.name}, Publication Date: {self.publication_date}"


class Library:
    def __init__(self):
        self.collection = []

    def add_book(self, book):
        if book not in self.collection:
            self.collection.append(book)
            print(f"Book {book} added to library collection.")
        else:
            print(f"Book {book} already exists in library collection.")

    def list_books(self):
        if not self.collection:
            print("Library has no books in its collection.")
            return

        print("Library's book collection:")
        for book in self.collection:
            print(book)
            
if __name__ == "__main__":
    #Create autors
    tolkien = Author("J.R.R Tolkien", "January 3, 1892", "British")
    rowling = Author("J.K Rowling", "July 31, 1965", "British")
    
    library = Library()
    
    tolkien.write_book("The Hobbit", "September 21, 1937")
    tolkien.write_book("The Fellowship of the Ring", "July 29, 1954")
    tolkien.write_book("The Two Towers", "November 11, 1954")
    tolkien.write_book("The Return of the King", "October 20, 1954")
    
    rowling.write_book("The Philosopher's Stone", "June 26, 1997")
    rowling.write_book("The Chamber of Secrets", "July 2, 1998")
    rowling.write_book("The Prisoner of Azkaban", "July 8, 1999")
    rowling.write_book("The Goblet of Fire", "July 8, 2000")

    
    for author in Author.all_authors:
        for book in author.books:
            library.add_book(book)
            
    print()
    library.list_books()