import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username:string;
  title:string;
  private logoPath = "./assets/img/mpa.png";
  constructor(private router: Router,
   private route: ActivatedRoute,
   private authService: AuthenticationService) { }

  ngOnInit() {
    this.authService.pageTitle.subscribe(title => this.title = title);
    this.username = this.authService.username;
  }

  backToHome(){
    if(!this.router.url.includes("home")){
      this.router.navigate(['/home']);
    }
  }

}
