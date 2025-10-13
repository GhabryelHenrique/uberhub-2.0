import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Deal {
  productName: string;
  productImage: string;
  location: string;
  dateTime: string;
  price: number;
  amount: string;
  status: 'Delivered' | 'Pending' | 'Cancelled';
}

@Component({
  selector: 'app-deals-table',
  imports: [CommonModule],
  templateUrl: './deals-table.component.html',
  styleUrl: './deals-table.component.scss'
})
export class DealsTableComponent {
  deals: Deal[] = [
    {
      productName: 'Apple Watch',
      productImage: 'https://ui-avatars.com/api/?name=AW&background=6200ea&color=fff&size=40',
      location: '6096 Marjolaine Landing',
      dateTime: '12.09.2019 - 12:53 PM',
      price: 423,
      amount: '$34,295',
      status: 'Delivered'
    },
    {
      productName: 'iPhone 13 Pro',
      productImage: 'https://ui-avatars.com/api/?name=IP&background=00bcd4&color=fff&size=40',
      location: '2721 Kunde Locks',
      dateTime: '14.09.2019 - 10:30 AM',
      price: 512,
      amount: '$42,890',
      status: 'Delivered'
    },
    {
      productName: 'MacBook Pro',
      productImage: 'https://ui-avatars.com/api/?name=MB&background=ff9800&color=fff&size=40',
      location: '8457 Apple Street',
      dateTime: '15.09.2019 - 02:15 PM',
      price: 298,
      amount: '$28,450',
      status: 'Pending'
    },
    {
      productName: 'AirPods Pro',
      productImage: 'https://ui-avatars.com/api/?name=AP&background=4caf50&color=fff&size=40',
      location: '9234 Tech Avenue',
      dateTime: '16.09.2019 - 04:20 PM',
      price: 689,
      amount: '$52,100',
      status: 'Delivered'
    },
    {
      productName: 'iPad Air',
      productImage: 'https://ui-avatars.com/api/?name=IA&background=e91e63&color=fff&size=40',
      location: '1567 Digital Plaza',
      dateTime: '17.09.2019 - 11:45 AM',
      price: 345,
      amount: '$31,220',
      status: 'Cancelled'
    }
  ];
}
