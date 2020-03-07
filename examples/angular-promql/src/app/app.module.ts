import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CodemirrorModule } from "@ctrl/ngx-codemirror";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CodemirrorModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
