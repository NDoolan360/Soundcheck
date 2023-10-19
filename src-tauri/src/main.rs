#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod auth;
use crate::auth::{authenticate, deauthenticate, is_authenticated};

mod playback;
use crate::playback::{
    check_liked, get_device_list, get_playback_state, next_track, previous_track, seek, set_device,
    set_liked, set_playing, set_repeat, set_shuffle, set_volume,
};

use rspotify::{scopes, AuthCodePkceSpotify, Config, Credentials, OAuth};
use std::sync::Mutex;
use tauri::{generate_handler, Builder, Manager, WindowEvent};
use tauri_plugin_log::LogTarget::{LogDir, Stdout, Webview};

pub struct Spotify(Mutex<AuthCodePkceSpotify>);

pub const SPOTIFY_REQUIRED_SCOPES: &str =
    "user-read-playback-state user-modify-playback-state user-library-read user-library-modify";
pub const SPOTIFY_CACHE_FILENAME: &str = ".spotify-token-cache";

fn main() {
    Builder::default()
        .manage(Spotify(Mutex::new(AuthCodePkceSpotify::with_config(
            Credentials::new_pkce(env!("SPOTIFY_CLIENT_ID")),
            OAuth {
                redirect_uri: env!("SPOTIFY_REDIRECT_URI").into(),
                scopes: scopes!(SPOTIFY_REQUIRED_SCOPES),
                ..Default::default()
            },
            Config {
                token_cached: true,
                ..Default::default()
            },
        ))))
        .invoke_handler(generate_handler![
            authenticate,
            deauthenticate,
            is_authenticated,
            get_playback_state,
            get_device_list,
            check_liked,
            next_track,
            previous_track,
            seek,
            set_liked,
            set_playing,
            set_repeat,
            set_shuffle,
            set_volume,
            set_device
        ])
        .setup(|app| {
            let window = app.get_window("player").unwrap();
            window_shadows::set_shadow(&window, true).expect("Unsupported platform!");
            // Set cache path location for rspotify cached token
            if let Some(state) = app.try_state::<Spotify>() {
                state.0.lock().unwrap().config.cache_path =
                    tauri::api::path::app_data_dir(&app.config())
                        .expect("No cache directory found in app")
                        .join(SPOTIFY_CACHE_FILENAME);
            }
            Ok(())
        })
        .on_window_event(|e| {
            if let WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_nanos(1));
            }
        })
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogDir, Stdout, Webview])
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    log::info!("App started.");
}
