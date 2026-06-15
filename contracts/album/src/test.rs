use crate::{Album, AlbumClient};
use soroban_sdk::{testutils::Address as _, Address, Env};
use sticker::{Sticker, StickerClient};

const CEO: u32 = 0;
const CTO: u32 = 1;

/// Deploy Sticker + Album and wire Album as Sticker's burner (the Album→Sticker
/// edge). Sticker's minter is `admin`, so tests can hand stickers to owners.
fn setup<'a>(e: &'a Env) -> (StickerClient<'a>, AlbumClient<'a>) {
    let admin = Address::generate(e);
    let sticker_id = e.register(Sticker, (admin.clone(), admin.clone(), admin.clone()));
    let album_id = e.register(Album, (admin.clone(), sticker_id.clone()));

    let sticker = StickerClient::new(e, &sticker_id);
    sticker.set_burner(&album_id);

    (sticker, AlbumClient::new(e, &album_id))
}

#[test]
fn open_album_creates_one() {
    let e = test_utils::setup();
    let (_sticker, album) = setup(&e);
    let alice = Address::generate(&e);

    album.open_album(&alice);

    assert!(album.has_album(&alice));
    assert_eq!(album.filled(&alice), 0);
}

#[test]
#[should_panic(expected = "already has an album")]
fn open_album_twice_traps() {
    let e = test_utils::setup();
    let (_sticker, album) = setup(&e);
    let alice = Address::generate(&e);

    album.open_album(&alice);
    album.open_album(&alice);
}

#[test]
fn paste_burns_sticker_and_fills_slot() {
    let e = test_utils::setup();
    let (sticker, album) = setup(&e);
    let alice = Address::generate(&e);
    sticker.mint(&alice, &CEO, &1);
    album.open_album(&alice);

    album.paste(&alice, &CEO);

    assert!(album.is_pasted(&alice, &CEO));
    assert_eq!(album.filled(&alice), 1);
    // The sticker was consumed.
    assert_eq!(sticker.balance(&alice, &CEO), 0);
}

#[test]
#[should_panic(expected = "open an album first")]
fn paste_without_album_traps() {
    let e = test_utils::setup();
    let (sticker, album) = setup(&e);
    let alice = Address::generate(&e);
    sticker.mint(&alice, &CEO, &1);

    album.paste(&alice, &CEO);
}

#[test]
#[should_panic(expected = "slot already filled")]
fn pasting_a_filled_slot_traps() {
    let e = test_utils::setup();
    let (sticker, album) = setup(&e);
    let alice = Address::generate(&e);
    sticker.mint(&alice, &CEO, &2); // two copies
    album.open_album(&alice);

    album.paste(&alice, &CEO);
    album.paste(&alice, &CEO); // slot is taken; the duplicate can't be pasted
}

#[test]
#[should_panic] // Sticker.burn traps on insufficient balance
fn paste_without_owning_the_sticker_traps() {
    let e = test_utils::setup();
    let (_sticker, album) = setup(&e);
    let alice = Address::generate(&e);
    album.open_album(&alice);

    album.paste(&alice, &CTO); // never minted to Alice
}

#[test]
fn distinct_types_fill_distinct_slots() {
    let e = test_utils::setup();
    let (sticker, album) = setup(&e);
    let alice = Address::generate(&e);
    sticker.mint(&alice, &CEO, &1);
    sticker.mint(&alice, &CTO, &1);
    album.open_album(&alice);

    album.paste(&alice, &CEO);
    album.paste(&alice, &CTO);

    assert_eq!(album.filled(&alice), 2);
    assert!(album.is_pasted(&alice, &CEO));
    assert!(album.is_pasted(&alice, &CTO));
}
