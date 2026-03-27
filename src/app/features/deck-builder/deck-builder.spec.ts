import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckBuilder } from './deck-builder';

describe('DeckBuilder', () => {
  let component: DeckBuilder;
  let fixture: ComponentFixture<DeckBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(DeckBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
