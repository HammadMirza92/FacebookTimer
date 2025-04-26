import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() message!: string;
  @Input() dismissible: boolean = true;
  @Input() icon!: string;

  showAlert: boolean = true;

  constructor() { }

  ngOnInit(): void {
    if (!this.icon) {
      this.setDefaultIcon();
    }
  }

  private setDefaultIcon(): void {
    switch (this.type) {
      case 'info':
        this.icon = 'info';
        break;
      case 'success':
        this.icon = 'check_circle';
        break;
      case 'warning':
        this.icon = 'warning';
        break;
      case 'error':
        this.icon = 'error';
        break;
      default:
        this.icon = 'info';
    }
  }

  dismiss(): void {
    this.showAlert = false;
  }
}
