import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  bookQuery = gql`
    query book($bookId: String) {
      book(id: $bookId) {
        _id
        isbn
        title
        author
        description
        published_year
        publisher
      }
    }
  `;

  submitBook = gql`
    mutation updateBook(
      $id: String!,
      $isbn: String!,
      $title: String!,
      $author: String!,
      $description: String!,
      $publisher: String!,
      $published_year: Int!) {
      updateBook(
        id: $id,
        isbn: $isbn,
        title: $title,
        author: $author,
        description: $description,
        publisher: $publisher,
        published_year: $published_year) {
        _id
      }
    }
  `;

  book: any = { id: '', isbn: '', title: '', author: '', description: '', publisher: '', publishedYear: null, updatedDate: null };
  isLoadingResults = true;
  resp: any = {};

  id = '';
  isbn = '';
  title = '';
  author = '';
  description = '';
  publisher = '';
  publishedYear = null;
  matcher = new MyErrorStateMatcher();
  bookForm : FormGroup;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.bookForm = this.getBuilder();
  }

  ngOnInit(): void {
    this.bookForm = this.getBuilder();
    this.getBookDetails();
  }

  getBuilder(){
    return this.formBuilder.group({
      isbn : [null, Validators.required],
      title : [null, Validators.required],
      author : [null, Validators.required],
      description : [null, Validators.required],
      publisher : [null, Validators.required],
      publishedYear : [null, Validators.required]
    });
  }

  get f() {
    return this.bookForm.controls;
  }

  getBookDetails() {
    const id = this.route.snapshot.params.id;
    let query : QueryRef<any, any> = this.apollo.watchQuery({
      query: this.bookQuery,
      variables: { bookId: id }
    });

    query.valueChanges.subscribe(res => {
      this.book = res.data.book;
      console.log(this.book);
      this.id = this.book._id;
      this.isLoadingResults = false;
      this.bookForm.setValue({
        isbn: this.book.isbn,
        title: this.book.title,
        author: this.book.author,
        description: this.book.description,
        publisher: this.book.publisher,
        publishedYear: this.book.published_year
      });
    });
  }

  onSubmit(form: any) {
    this.isLoadingResults = true;
    console.log(this.id);
    console.log(JSON.stringify(form))
    const bookData = form;
    this.apollo.mutate({
      mutation: this.submitBook,
      variables: {
        id: this.id,
        isbn: bookData.isbn,
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        publisher: bookData.publisher,
        published_year: bookData.publishedYear
      },
      refetchQueries: [{
        query: gql`{ books { _id, title, author } }`,
      }]
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.isLoadingResults = false;
      this.apollo.getClient().clearStore();
      this.bookDetails()
    }, (error) => {
      console.log('there was an error sending the query', error);
      this.isLoadingResults = false;
    });
  }

  bookDetails() {
    this.router.navigate(['/books/detail/', this.id]);
  }

}
