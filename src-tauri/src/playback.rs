use rspotify::model::{
    AdditionalType::{Episode, Track},
    CurrentPlaybackContext, Device, RepeatState, TrackId,
};
use rspotify::prelude::*;
use tauri::{command, State};

use crate::Spotify;

#[command]
pub async fn get_playback_state(
    state: State<'_, Spotify>,
) -> Result<Option<CurrentPlaybackContext>, String> {
    let spotify = state.0.lock().unwrap().clone();
    spotify
        .current_playback(None, Some([&Track, &Episode]))
        .await
        .or_else(|e| Err(format!("{:#?}", e)))
}

#[command]
pub async fn get_device_list(state: State<'_, Spotify>) -> Result<Vec<Device>, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.device().await;
    match out {
        Ok(device_list) => Ok(device_list),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn set_device(device_id: String, state: State<'_, Spotify>) -> Result<String, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.transfer_playback(&device_id, None).await;
    match out {
        Ok(_) => Ok(device_id),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn set_volume(volume_percent: u8, state: State<'_, Spotify>) -> Result<u8, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.volume(volume_percent, None).await;
    match out {
        Ok(_) => Ok(volume_percent),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn set_playing(play_state: bool, state: State<'_, Spotify>) -> Result<bool, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = match play_state {
        true => spotify.resume_playback(None, None).await,
        false => spotify.pause_playback(None).await,
    };
    match out {
        Ok(_) => Ok(play_state),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn previous_track(state: State<'_, Spotify>) -> Result<(), String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.previous_track(None).await;
    match out {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn seek(progress: u32, state: State<'_, Spotify>) -> Result<u32, String> {
    let spotify = state.0.lock().unwrap().clone();
    let duration = chrono::Duration::milliseconds(progress.into());
    let out = spotify.seek_track(duration, None).await;
    match out {
        Ok(_) => Ok(progress),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn next_track(state: State<'_, Spotify>) -> Result<(), String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.next_track(None).await;
    match out {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn set_shuffle(shuffle_state: bool, state: State<'_, Spotify>) -> Result<bool, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.shuffle(shuffle_state, None).await;
    match out {
        Ok(_) => Ok(shuffle_state),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn set_repeat(
    repeat_state: RepeatState,
    state: State<'_, Spotify>,
) -> Result<RepeatState, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = spotify.repeat(repeat_state, None).await;
    match out {
        Ok(_) => Ok(repeat_state),
        Err(e) => Err(format!("{:#?}", e)),
    }
}

#[command]
pub async fn check_liked(track_id: String, state: State<'_, Spotify>) -> Result<bool, String> {
    let limit = 50;
    let mut offset = 0;
    let spotify = state.0.lock().unwrap().clone();
    loop {
        let page = spotify
            .current_user_saved_tracks_manual(None, Some(limit), Some(offset))
            .await
            .unwrap();
        for item in page.items {
            if item.track.is_local {
                return Err("Track is local, cannot save it.".to_string());
            }
            if item.track.id.unwrap().id() == &track_id {
                return Ok(true);
            }
        }
        if page.next.is_none() {
            break;
        }
        offset += limit;
    }
    Ok(false)
}

#[command]
pub async fn set_liked(
    track_id: String,
    liked_state: bool,
    state: State<'_, Spotify>,
) -> Result<bool, String> {
    let spotify = state.0.lock().unwrap().clone();
    let out = match liked_state {
        false => {
            spotify
                .current_user_saved_tracks_delete(vec![TrackId::from_id(&track_id).unwrap()])
                .await
        }
        true => {
            spotify
                .current_user_saved_tracks_add(vec![TrackId::from_id(&track_id).unwrap()])
                .await
        }
    };
    match out {
        Ok(()) => Ok(liked_state),
        Err(e) => Err(format!("{:?}", e)),
    }
}
