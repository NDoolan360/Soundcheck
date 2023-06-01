#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod auth;
use crate::auth::{authenticate, is_authenticated};

mod playback;
use crate::playback::{
    check_like, get_device_list, get_playback_state, next_track, previous_track, seek, set_device,
    set_like, set_playing, set_repeat, set_shuffle, set_volume,
};

use rspotify::{scopes, AuthCodePkceSpotify, Config, Credentials, OAuth};
use std::sync::Mutex;
use tauri::{generate_handler, Builder, Manager};
use tauri_plugin_log::LogTarget::{LogDir, Stdout, Webview};

pub struct Spotify(Mutex<AuthCodePkceSpotify>);

fn main() {
    let creds = Credentials::new_pkce(env!("RSPOTIFY_CLIENT_ID"));
    let oauth = OAuth {
        redirect_uri: env!("RSPOTIFY_REDIRECT_URI").into(),
        scopes: scopes!(
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-library-read",
            "user-library-modify"
        ),
        ..Default::default()
    };
    let config = Config {
        token_cached: true,
        ..Default::default()
    };

    Builder::default()
        .manage(Spotify(Mutex::new(AuthCodePkceSpotify::with_config(
            creds, oauth, config,
        ))))
        .invoke_handler(generate_handler![
            authenticate,
            is_authenticated,
            get_playback_state,
            get_device_list,
            check_like,
            next_track,
            previous_track,
            seek,
            set_like,
            set_playing,
            set_repeat,
            set_shuffle,
            set_volume,
            set_device
        ])
        .setup(|app| {
            let window = app.get_window("player").unwrap();
            window_shadows::set_shadow(&window, true).expect("Unsupported platform!");
            Ok(())
        })
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogDir, Stdout, Webview])
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
