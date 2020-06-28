import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddServerPageRoutingModule } from './add-server-routing.module';

import { AddServerPage } from './add-server.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddServerPageRoutingModule
  ],
  declarations: [AddServerPage]
})
export class AddServerPageModule {}
