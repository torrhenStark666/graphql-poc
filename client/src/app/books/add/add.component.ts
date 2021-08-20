import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { MyErrorStateMatcher } from '../edit/edit.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  submitBook = gql`
  mutation addBook(
    $isbn: String!,
    $title: String!,
    $author: String!,
    $description: String!,
    $publisher: String!,
    $published_year: Int!) {
    addBook(
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

  book: any = { isbn: '', title: '', author: '', description: '', publisher: '', publishedYear: null, updatedDate: null };
  isLoadingResults = false;
  resp: any = {};
  isbn = '';
  title = '';
  author = '';
  description = '';
  publisher = '';
  publishedYear = null;
  bookForm : FormGroup;

  matcher = new MyErrorStateMatcher();

  constructor(
    private apollo: Apollo,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.bookForm = this.getFormGroup()
  }

  ngOnInit(): void {
    this.bookForm = this.getFormGroup()
  }

  getFormGroup() {
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

  onSubmit(form: any) {
    this.isLoadingResults = true;
    const bookData = form;
    this.apollo.mutate({
      mutation: this.submitBook,
      variables: {
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
    }).subscribe(( data : any ) => {
      console.log('got data', data);
      this.isLoadingResults = false;
      this.apollo.getClient().clearStore();
      this.router.navigate(['/books']);
    }, (error) => {
      console.log('there was an error sending the query', error);
      this.isLoadingResults = false;
    });
  }


}
