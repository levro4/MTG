import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSearch } from './card-search';

describe('CardSearch', () => {
  let component: CardSearch;
  let fixture: ComponentFixture<CardSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
