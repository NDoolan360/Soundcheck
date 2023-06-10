use chrono::{Duration, Utc};
use rspotify::{prelude::*, AuthCodePkceSpotify, ClientError::CacheFile, ClientResult, Token};
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use tauri::{command, Manager, State, Window, WindowEvent, WindowUrl};

use crate::Spotify;

#[command]
pub async fn authenticate(window: Window, state: State<'_, Spotify>) -> Result<bool, String> {
    if let Ok(true) = is_authenticated(state.clone()).await {
        return Ok(true);
    }
    if let Some(auth_window) = window.get_window("auth") {
        auth_window.set_focus().unwrap();
        return Err(format!(
            "Auth window is already open, try again"
        ));
    }
    let mut spotify = state.0.lock().unwrap().clone();
    match start_server(&window, &mut spotify) {
        Ok(stream) => match handle_connection(stream, &mut spotify).await {
            Ok(_) => {
                window.get_window("auth").unwrap().close().unwrap();
                Ok(true)
            }
            Err(e) => Err(e),
        },
        Err(()) => Err(format!("Auth server stream error")),
    }
}

#[command]
pub async fn is_authenticated(state: State<'_, Spotify>) -> Result<bool, ()> {
    let spotify = state.0.lock().unwrap().clone();
    match get_cached_token(&spotify).await {
        Ok(_) => Ok(true),
        Err(_) => Err(()),
    }
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
    let port = spotify
        .get_oauth()
        .redirect_uri
        .split(':')
        .last()
        .expect("Could not find port in redirect URI.");

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

    match TcpListener::bind(format!("127.0.0.1:{}", port)) {
        // If the bind fails, handle the error and return early.
        Err(e) => {
            // Special print for common case of socket already taken.
            if e.to_string().contains("(os error 10048)") {
                log::error!("Failed to bind to 127.0.0.1:{}: Socket conflict", port);
            } else {
                log::error!("Failed to bind to 127.0.0.1:{}: {}", port, e);
            }
        }
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
    }
    Err(())
}

pub async fn handle_connection(
    mut stream: TcpStream,
    spotify: &mut AuthCodePkceSpotify,
) -> Result<(), String> {
    let mut buffer = [0; 2048];
    stream.read(&mut buffer).unwrap();

    // convert buffer into string and 'parse' the URL
    match String::from_utf8(buffer.to_vec()) {
        Ok(request) => {
            let split: Vec<&str> = request.split_whitespace().collect();
            if split.len() > 1 {
                let host = &spotify.get_oauth().redirect_uri;
                let path = &split[1].to_string();
                match spotify.parse_response_code(&format!("{}{}", host, path)) {
                    Some(code) => match spotify.request_token(&code).await {
                        Ok(()) => {
                            respond_with_success(stream);
                            Ok(())
                        }
                        Err(e) => {
                            respond_with_error(format!("Auth server error: {}", e), stream);
                            Err(e.to_string())
                        }
                    },
                    None => {
                        respond_with_error("Auth server code returned error".to_string(), stream);
                        Err(format!("Auth server code returned error"))
                    }
                }
            } else {
                respond_with_error("Malformed request".to_string(), stream);
                Err(format!("Malformed request"))
            }
        }
        Err(e) => {
            respond_with_error(format!("Invalid UTF-8 sequence: {}", e), stream);
            Err(format!("Invalid UTF-8 sequence: {}", e))
        }
    }
}

fn respond_with_success(mut stream: TcpStream) {
    let response = format!("HTTP/1.1 200 OK\r\n\r\nSuccess");
    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn respond_with_error(e: String, mut stream: TcpStream) {
    log::error!("Error: {}", e);
    let response = format!("HTTP/1.1 400 Bad Request\r\n\r\n400 - Bad Request - {}", e);
    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

pub async fn get_cached_token(spotify: &AuthCodePkceSpotify) -> ClientResult<Token> {
    // if expired refetch and cache
    let token_expired = spotify
        .get_token()
        .lock()
        .await
        .unwrap()
        .as_ref()
        .map_or(true, |token| {
            token.expires_at.map_or(true, |expiration| {
                Utc::now() + Duration::minutes(30) >= expiration
            })
        });
    if token_expired {
        *spotify.get_token().lock().await.unwrap() = spotify.refetch_token().await?;
        spotify.write_token_cache().await?;
    }

    // return token from cache
    match spotify.read_token_cache(false).await? {
        Some(cached_token) => {
            *spotify.get_token().lock().await.unwrap() = Some(cached_token.clone());
            Ok(cached_token)
        }
        None => Err(CacheFile(format!("No token found in cache"))),
    }
}
