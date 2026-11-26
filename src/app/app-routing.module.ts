import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module')
      .then(m => m.LoginPageModule)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro/cadastro.module')
      .then(m => m.CadastroPageModule)
  },
  {
    path: 'agendar',
    loadChildren: () => import('./agendar/agendar.module')
      .then(m => m.AgendarPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./menu-inferior/menu-inferior.module')
      .then(m => m.MenuInferiorPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}