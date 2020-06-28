import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddServerPage } from './add-server.page';

describe('AddServerPage', () => {
  let component: AddServerPage;
  let fixture: ComponentFixture<AddServerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddServerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
