import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuInferiorPage } from './menu-inferior.page';

describe('MenuInferiorPage', () => {
  let component: MenuInferiorPage;
  let fixture: ComponentFixture<MenuInferiorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuInferiorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
