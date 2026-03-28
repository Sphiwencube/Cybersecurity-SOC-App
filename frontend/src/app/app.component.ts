import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as AOS from 'aos';   

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  ngOnInit() {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });
  }
}