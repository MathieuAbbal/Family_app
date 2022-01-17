import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeletePhotoComponent } from './dialog-delete-photo.component';

describe('DialogDeletePhotoComponent', () => {
  let component: DialogDeletePhotoComponent;
  let fixture: ComponentFixture<DialogDeletePhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDeletePhotoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeletePhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
