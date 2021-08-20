import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './books/add/add.component';
import { BooksComponent } from './books/books.component';
import { DetailComponent } from './books/detail/detail.component';
import { EditComponent } from './books/edit/edit.component';

const routes: Routes = [
  {
    path: 'books',
    component: BooksComponent,
    data: {tittle : 'Books'}
  },
  {
    path: 'books/detail/:id',
    component: DetailComponent,
    data: {tittle : 'Book Detail'}
  },
  {
    path: 'books/add',
    component: AddComponent,
    data: {tittle : 'Add New Book'}
  },
  {
    path: 'books/edit/:id',
    component: EditComponent,
    data: {tittle : 'Edit Book'}
  },
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
