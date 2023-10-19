use rspotify::{prelude::*, AuthCodePkceSpotify, Token};
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream, ToSocketAddrs};
use tauri::{command, Manager, State, Window, WindowEvent, WindowUrl};
use url::Url;

use crate::Spotify;

#[command]
pub async fn authenticate(window: Window, state: State<'_, Spotify>) -> Result<bool, String> {
    if let Ok(true) = is_authenticated(state.clone()).await {
        return Ok(true);
    }
    if let Some(auth_window) = window.get_window("auth") {
        auth_window.set_focus().unwrap();
        return Err(format!("Auth window is already open, try again"));
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
    let token = spotify.get_token().lock().await.unwrap().clone();
    match token {
        Some(_) => Ok(true),
        None => Ok(false),
    }
}

#[command]
pub async fn deauthenticate(state: State<'_, Spotify>) -> Result<bool, ()> {
    let spotify = state.0.lock().unwrap().clone();
    let new_token = Some(Token::default());
    *spotify.get_token().lock().await.unwrap() = new_token;
    match spotify.write_token_cache().await {
        Ok(()) => Ok(false),
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
    let redirect: Url = spotify.get_oauth().redirect_uri.parse::<Url>().unwrap();
    let host = redirect
        .host_str()
        .expect("No host found in SPOTIFY_REDIRECT_URI.");
    let port = redirect
        .port()
        .expect("No port found in SPOTIFY_REDIRECT_URI.");

    println!("{:#?}", redirect);

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
        Err(e) => {
            if e.to_string().contains("(os error 10048)") {
                log::error!("Failed to bind to {:#?}: Socket conflict", address);
            } else {
                log::error!("Failed to bind to {:#?}: {}", address, e);
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

    if let Ok(request) = String::from_utf8(buffer.to_vec()) {
        let split: Vec<&str> = request.split_whitespace().collect();
        if split.len() <= 1 {
            respond_with_error("Malformed request".to_string(), stream);
            return Err("Malformed request".to_string());
        }
        let host = &spotify.get_oauth().redirect_uri;
        let path = &split[1].to_string();
        if let Some(code) = spotify.parse_response_code(&format!("{}{}", host, path)) {
            match spotify.request_token(&code).await {
                Ok(()) => {
                    respond_with_success(stream);
                    Ok(())
                }
                Err(e) => {
                    respond_with_error(format!("Auth server error: {}", e), stream);
                    Err(e.to_string())
                }
            }
        } else {
            respond_with_error("Auth server code returned error".to_string(), stream);
            Err("Auth server code returned error".to_string())
        }
    } else {
        respond_with_error("Invalid UTF-8 sequence".to_string(), stream);
        Err("Invalid UTF-8 sequence".to_string())
    }
}

fn respond_with_success(mut stream: TcpStream) {
    let response = "HTTP/1.1 200 OK\r\n\r\n";
    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn respond_with_error(message: String, mut stream: TcpStream) {
    log::error!("Error: {}", message);
    let response = format!("HTTP/1.1 500 Internal Server Error\r\n\r\n{}", message);
    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
