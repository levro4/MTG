export interface MagicCard {
  id: string;
  name: string;
  image_uris?: {
    normal: string;
  };
  card_faces?: {
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    image_uris?: {
      normal: string;
    }
  }[];
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  prices?: {
    eur?: string;
    usd?: string;
  };
}
