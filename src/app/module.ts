import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";

import {MangaBoard} from './pages/mangaBoard';
import {InfiniteScroll} from "./common/components/scroller/infiniteScrolling";
import {ApplicationHeader} from "./common/components/header/applicationHeader";
import {Dashboard} from "./pages/dashboard/components/dashboard";
import {MangaDescription} from "./pages/description/components/mangaDescription";
import {MangaReader} from "./pages/reader/components/mangaReader";

import {TrimStringPipe} from "./common/pipes/trimStringPipe";
import {ReverseArrayPipe} from "./common/pipes/reverseArrayPipe";
import {ArrayLengthFilterPipe} from "./common/pipes/arrayLengthFilterPipe";

import {ApplicationService} from "./common/services/applicationService";
import {LocalStorageService} from "./common/services/data/localStorageService";

function getServices() {
  return [
    LocalStorageService,
    ApplicationService
  ];
}

function getPipes() {
  return [
    TrimStringPipe,
    ReverseArrayPipe,
    ArrayLengthFilterPipe
  ];
}

function getComponents() {
 return [
    MangaBoard,
    InfiniteScroll,
    ApplicationHeader,
    Dashboard,
    MangaDescription,
    MangaReader
 ];
}

function getDeclarations() {
  let components = getComponents();
  let pipes = getPipes();

  return components.concat(pipes);
}

@NgModule({
  imports: [ 
    BrowserModule,
    RouterModule.forRoot([{
      path: "",
      component: Dashboard
    }, {
      path: "manga/:name",
      component: MangaDescription
    }, {
      path: "manga/:name/:chapter/:page",
      component: MangaReader
    }])
  ],
  declarations: getDeclarations(),
  providers: getServices(),
  bootstrap: [MangaBoard]
})

export class MangaBoardModule { }
