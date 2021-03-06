import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ReportFilter } from '../../../../classes/report';
import { AuthenticationService } from '../../../../services/authentication.service';

@Component({
  selector: 'app-report-print',
  templateUrl: './report-print.component.html',
  styleUrls: ['./report-print.component.css']
})
export class ReportPrintComponent implements OnInit {
  criteria = new ReportFilter();
  subtitle:string;
  username:string;
  currentdate:number;
  logoPath:string;
  constructor(private authService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) { }
  ngOnInit() {
    this.logoPath = this.authService.logoPath;
    let title = this.route.snapshot.paramMap.get('title');
    this.subtitle = "Report for " + title;

    this.authService.setReportTitle(title);

    this.username = this.authService.username;
    this.currentdate = Date.now();

    let start_date = this.route.snapshot.queryParams["start_date"];
    let end_date = this.route.snapshot.queryParams["end_date"];
    this.criteria.start_date = start_date;
    this.criteria.end_date = end_date;
    this.criteria.requestor_id = this.route.snapshot.queryParams["requester"];
    this.criteria.cat_id = this.route.snapshot.queryParams["category"];
    this.criteria.reviewer_id = this.route.snapshot.queryParams["reviewer"];
    this.criteria.deptmt_id = this.route.snapshot.queryParams["dept"];
    this.authService.setReportFilter(this.criteria);

    if(start_date == null)
      this.criteria.start_date_display = "All";
    else this.criteria.start_date_display = start_date;
    if(end_date == null)
      this.criteria.end_date_display = "All";
    else this.criteria.end_date_display = end_date;
    if(this.criteria.requestor_id != null)
    {
      const requester = this.authService.requesters.find(item => +(item.user_id) == +this.criteria.requestor_id);
      this.criteria.requestor_name = requester.fname + " " + requester.lname;
    }
    else if(this.criteria.requestor_id == null){
      this.criteria.requestor_name = "All";
    }
    if(this.criteria.reviewer_id != null){
      const reviewer = this.authService.allReviewers.find(item => +(item.user_id) == +this.criteria.reviewer_id);
      this.criteria.reviewer_name = reviewer.fname + " " + reviewer.lname;
    }
    else if(this.criteria.reviewer_id == null){
      this.criteria.reviewer_name = "All";
    }
    if(this.criteria.cat_id != null){
      this.criteria.category_name = this.authService.categories.find(item => +(item.category_id) == +this.criteria.cat_id).category_name;
    }
    else if(this.criteria.cat_id == null){
      this.criteria.category_name = "All";
    }
    if(this.criteria.deptmt_id){
      this.criteria.deptmt_name = this.authService.departments.find(item => +(item.deptmt_id) == +this.criteria.deptmt_id).deptmt_name;
    }
    else if(this.criteria.deptmt_id == null){
      this.criteria.deptmt_name = "All";
    }

  }

  printReport(){
    window.print();
  }

}
