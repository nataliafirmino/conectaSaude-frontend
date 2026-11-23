import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { MenuInferiorPageRoutingModule } from './menu-inferior-routing.module';

import { MenuInferiorPage } from './menu-inferior.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuInferiorPageRoutingModule,
  ],
  declarations: [MenuInferiorPage],
  exports: [MenuInferiorPage] 
})
export class MenuInferiorPageModule {}
