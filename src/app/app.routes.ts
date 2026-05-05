import { Routes } from '@angular/router';
import { MainPageComponent } from './components/main-page/main-page.component';
import { PlayerComponent } from './components/player/player.component';
import { MerchComponent } from './components/merch/merch.component';
import { HaliSahaComponent } from './components/hali-saha/hali-saha.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { HalisahaDetayComponent } from './components/halisaha-detay/halisaha-detay.component';
import { ProductComponent } from './components/product/product.component';
import { TeamDetailsComponent } from './components/team-details/team-details.component';
import { TeamsComponent } from './components/teams/teams.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HalisahaCreateComponent } from './components/halisaha-create/halisaha-create.component';
import { LastMatchesComponent } from './components/last-matches/last-matches.component';
import { ProductCreateComponent } from './components/product-create/product-create.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {path: '', component: MainPageComponent},
    {path: 'player/:id', component: PlayerComponent},
    {path: 'merch', component: MerchComponent},
    {path: 'merch/:productid', component: ProductComponent},
    {path: 'halisaha', component: HaliSahaComponent},
    {path: 'halisaha/:id', component: HalisahaDetayComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'reset-password', component: ResetPasswordComponent},
    {path: 'admin-panel', component: AdminPanelComponent, canActivate: [adminGuard]},
    {path: 'teams', component: TeamsComponent},
    {path: 'teams/:teamid', component: TeamDetailsComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'halisaha-create', component: HalisahaCreateComponent},
    {path: 'last-matches', component: LastMatchesComponent},
    {path: 'create-product', component: ProductCreateComponent}
];
