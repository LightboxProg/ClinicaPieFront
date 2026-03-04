import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GlobalApiService } from 'src/app/services/global-api.service';
import { ActivatedRoute, Route } from '@angular/router';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('checkoutElement') checkoutElement!: ElementRef;
  stripe: any;
  checkout: any;
  id: any;

  constructor(private http: HttpClient, private api: GlobalApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');        
    });

    this.initializeStripe();
  }

  async initializeStripe() {
    this.stripe = Stripe('pk_test_51QwBDaCO46TTbjXgv9kiyGprezeOvpcNJInocwKBKzie3Hbihp6dupia8WW0dX1Qp7TgqyWiDkf30AMgKn13I04d00OwMHN4jZ');

    try {
      const clientSecret = this.id;
      
      this.checkout = await this.stripe.initEmbeddedCheckout({
        fetchClientSecret: () => Promise.resolve(clientSecret)
      });

      // Montar el checkout en el elemento del DOM
      this.checkout.mount(this.checkoutElement.nativeElement);
      
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
    }
  }


}
