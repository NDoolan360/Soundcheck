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
use tauri::{command, generate_handler, Builder, Manager, WindowEvent};
use tauri_plugin_log::LogTarget::{LogDir, Stdout, Webview};
use tauri_plugin_window_state::{AppHandleExt, StateFlags, WindowExt};

pub struct SpotifyState(Mutex<AuthCodePkceSpotify>);

impl SpotifyState {
    pub fn new(creds: Credentials, oauth: OAuth, config: Config) -> Self {
        SpotifyState(Mutex::new(AuthCodePkceSpotify::with_config(
            creds, oauth, config,
        )))
    }
    pub fn get_spotify(&self) -> AuthCodePkceSpotify {
        self.0.lock().unwrap().clone()
    }
}

pub const SPOTIFY_REQUIRED_SCOPES: &str =
    "user-read-playback-state user-modify-playback-state user-library-read user-library-modify";
pub const SPOTIFY_CACHE_FILENAME: &str = ".spotify-token-cache";

#[command]
fn refresh_rate() -> Result<u32, String> {
    match option_env!("REFRESH_RATE") {
        Some(refresh_rate) => refresh_rate.parse::<u32>().map_err(|e| e.to_string()),
        None => Ok(5000),
    }
}

fn main() {
    Builder::default()
        .manage(SpotifyState::new(
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
        ))
        .invoke_handler(generate_handler![
            authenticate,
            check_liked,
            deauthenticate,
            get_device_list,
            get_playback_state,
            is_authenticated,
            next_track,
            previous_track,
            refresh_rate,
            seek,
            set_device,
            set_liked,
            set_playing,
            set_repeat,
            set_shuffle,
            set_volume,
        ])
        .setup(|app| {
            let window = app.get_window("player").unwrap();
            window_shadows::set_shadow(&window, true).expect("Unsupported platform!");
            //
            app.get_window("player")
                .map(|window| window.restore_state(StateFlags::all()));
            // Set cache path location for rspotify cached token
            if let Some(spotify) = app.try_state::<SpotifyState>() {
                let cache_path = tauri::api::path::app_data_dir(&app.config())
                    .expect("No cache directory found in app")
                    .join(SPOTIFY_CACHE_FILENAME);
                spotify.get_spotify().config.cache_path = cache_path;
            }
            Ok(())
        })
        .on_window_event(|e| match e.event() {
            WindowEvent::Moved(_) | WindowEvent::Resized(_) => {
                let _ = e.window().app_handle().save_window_state(StateFlags::all());
            }
            _ => {}
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
