import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Book } from 'src/app/shared/models/book';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  book: any = { _id: '', isbn: '', title: '', author: '', description: '', publisher: '', publishedYear: null };
  isLoadingResults = true;
  resp: any = {};

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

deleteQuery = gql`
  mutation removeBook($id: String!) {
    removeBook(id:$id) {
      _id
    }
  }
`;

  constructor(
    private apollo : Apollo,
    private router : Router,
    private route  : ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getBookDetails();
  }

  getBookDetails() {
    const id = this.route.snapshot.params.id;
    let query : QueryRef<any, any> = this.apollo.watchQuery({
      query: this.bookQuery,
      variables: { bookId : id  }
    });

    query.valueChanges.subscribe(res => {
      this.book = res.data.book;
      console.log(this.book);
      this.isLoadingResults = false;
    });
  }

  deleteBook(id : String) {
    this.isLoadingResults = true;
    const bookId = id;
    this.apollo.mutate({
      mutation: this.deleteQuery,
      variables: {
        id: bookId
      },
      refetchQueries: [{
        query: gql`{ books { _id, title, author } }`,
      }]
    }).subscribe(({ data }) => {
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
