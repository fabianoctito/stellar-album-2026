use crate::{Coin, CoinClient};
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    Address, Env, IntoVal,
};

fn deploy<'a>(e: &'a Env, admin: &Address, minter: &Address) -> CoinClient<'a> {
    let id = e.register(Coin, (admin.clone(), minter.clone()));
    CoinClient::new(e, &id)
}

#[test]
fn mint_increases_balance_and_supply() {
    let e = test_utils::setup();
    let admin = Address::generate(&e);
    let minter = Address::generate(&e);
    let user = Address::generate(&e);
    let coin = deploy(&e, &admin, &minter);

    coin.mint(&user, &1_000);

    assert_eq!(coin.balance(&user), 1_000);
    assert_eq!(coin.total_supply(), 1_000);
}

#[test]
fn transfer_moves_balance() {
    let e = test_utils::setup();
    let admin = Address::generate(&e);
    let minter = Address::generate(&e);
    let a = Address::generate(&e);
    let b = Address::generate(&e);
    let coin = deploy(&e, &admin, &minter);

    coin.mint(&a, &1_000);
    coin.transfer(&a, &b, &400);

    assert_eq!(coin.balance(&a), 600);
    assert_eq!(coin.balance(&b), 400);
}

#[test]
fn admin_can_repoint_minter() {
    let e = test_utils::setup();
    let admin = Address::generate(&e);
    let minter = Address::generate(&e);
    let new_minter = Address::generate(&e);
    let coin = deploy(&e, &admin, &minter);

    coin.set_minter(&new_minter);

    assert_eq!(coin.minter(), new_minter);
}

/// The minter's auth is what gates `mint` — proven by authorizing exactly that
/// address for exactly that call. This mirrors how the Faucet will mint.
#[test]
fn mint_succeeds_with_minter_auth() {
    let e = Env::default();
    let admin = Address::generate(&e);
    let minter = Address::generate(&e);
    let user = Address::generate(&e);
    let coin = deploy(&e, &admin, &minter);

    e.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &coin.address,
            fn_name: "mint",
            args: (user.clone(), 500_i128).into_val(&e),
            sub_invokes: &[],
        },
    }]);
    coin.mint(&user, &500);

    assert_eq!(coin.balance(&user), 500);
}

/// Without the minter's auth, `mint` must trap.
#[test]
#[should_panic]
fn mint_without_minter_auth_panics() {
    let e = Env::default();
    let admin = Address::generate(&e);
    let minter = Address::generate(&e);
    let user = Address::generate(&e);
    let coin = deploy(&e, &admin, &minter);

    coin.mint(&user, &500);
}
