use rspotify::{prelude::*, AuthCodePkceSpotify, Token};
use std::io::Read;
use std::net::{TcpListener, TcpStream, ToSocketAddrs};
use tauri::{command, Manager, State, Window, WindowEvent, WindowUrl};
use url::Url;

use crate::SpotifyState;

#[command]
pub async fn authenticate(window: Window, state: State<'_, SpotifyState>) -> Result<bool, String> {
    let mut spotify = state.get_spotify();
    if spotify.get_token().lock().await.unwrap().is_some() {
        return Ok(true);
    }
    if let Some(auth_window) = window.get_window("auth") {
        auth_window.set_focus().unwrap();
        return Err("Auth window is already open, try again".to_string());
    }
    match start_server(&window, &mut spotify) {
        Ok(stream) => {
            let result = handle_connection(stream, &mut spotify).await;
            window.get_window("auth").unwrap().close().unwrap();
            result.map(|_| true)
        }
        Err(()) => Err("Auth server stream error".to_string()),
    }
}

#[command]
pub async fn is_authenticated(state: State<'_, SpotifyState>) -> Result<bool, ()> {
    Ok(state
        .get_spotify()
        .get_token()
        .lock()
        .await
        .unwrap()
        .clone()
        .is_some())
}

#[command]
pub async fn deauthenticate(state: State<'_, SpotifyState>) -> Result<bool, ()> {
    let spotify = state.get_spotify();
    let new_token = Some(Token::default());
    *spotify.get_token().lock().await.unwrap() = new_token;
    spotify
        .write_token_cache()
        .await
        .map(|_| false)
        .map_err(|_| ())
}

pub fn start_server(window: &Window, spotify: &mut AuthCodePkceSpotify) -> Result<TcpStream, ()> {
    let url = WindowUrl::External(
        spotify
            .get_authorize_url(None)
            .expect("Url not generated correctly")
            .parse()
            .unwrap(),
    );

    log::info!("Authenticating...");
    let redirect: Url = spotify.get_oauth().redirect_uri.parse::<Url>().unwrap();
    let host = redirect
        .host_str()
        .expect("No host found in SPOTIFY_REDIRECT_URI.");
    let port = redirect
        .port()
        .expect("No port found in SPOTIFY_REDIRECT_URI.");

    let address = format!("{host}:{port}")
        .to_socket_addrs()
        .expect("Could not parse SPOTIFY_REDIRECT_URI address correctly.")
        .next()
        .expect("No valid address found in SPOTIFY_REDIRECT_URI.");

    let borrowed_window = window.clone();
    if window.get_window("auth").is_none() {
        tauri::WindowBuilder::new(window, "auth", url)
            .title("Spotify Authorisation")
            .focused(true)
            .always_on_top(true)
            .build()
            .unwrap()
            .on_window_event(move |e| {
                if let WindowEvent::CloseRequested { .. } = e {
                    let _ = borrowed_window.close();
                }
            })
    }

    match TcpListener::bind(address) {
        Ok(listener) => {
            for stream in listener.incoming() {
                match stream {
                    Ok(stream) => {
                        return Ok(stream);
                    }
                    Err(e) => {
                        log::error!("Error: {}", e);
                    }
                };
            }
        }
        Err(e) => {
            log::error!("Failed to bind to {:#?}: {}", address, e);
        }
    }
    Err(())
}

pub async fn handle_connection(
    mut stream: TcpStream,
    spotify: &mut AuthCodePkceSpotify,
) -> Result<(), String> {
    let mut buffer = String::new();
    stream
        .read_to_string(&mut buffer)
        .map_err(|e| e.to_string())?;

    match buffer.split_whitespace().nth(1) {
        Some(params) => {
            match spotify.parse_response_code(format!("http://localhost{params}").as_str()) {
                Some(code) => spotify
                    .request_token(&code)
                    .await
                    .map_err(|e| e.to_string()),
                None => Err("Error: Unable to parse response code".to_string()),
            }
        }
        None => Err("Error: Malformed response".to_string()),
    }
}
