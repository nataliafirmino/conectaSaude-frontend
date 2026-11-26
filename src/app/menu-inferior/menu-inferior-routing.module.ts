import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuInferiorPage } from './menu-inferior.page';

const routes: Routes = [
  {
    path: '',
    component: MenuInferiorPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module')
          .then(m => m.HomePageModule)
      },
      {
        path: 'consultas',
        loadChildren: () => import('../consultas/consultas.module')
          .then(m => m.ConsultasPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuInferiorPageRoutingModule {}