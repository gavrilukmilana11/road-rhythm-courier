/**
 * The ONLY module that touches the generated art. The file names are fixed by
 * the asset contract - never invent another one, it will not exist.
 */
export const assets = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  /** courier chicken with the parcel, drawn facing RIGHT */
  sprite1: require('../../assets/sprite_1.png'),
  /** stranded chick */
  sprite2: require('../../assets/sprite_2.png'),
  /** parcel / crate */
  sprite3: require('../../assets/sprite_3.png'),
  /** traffic van, drawn facing RIGHT - mirrored with scaleX for left lanes */
  sprite4: require('../../assets/sprite_4.png'),
  /** neon traffic light */
  sprite5: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
} as const;

export const COURIER = assets.sprite1;
export const CHICK = assets.sprite2;
export const PARCEL = assets.sprite3;
export const VAN = assets.sprite4;
export const SIGNAL = assets.sprite5;

export default assets;
