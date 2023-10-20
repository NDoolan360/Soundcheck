use rspotify::model::{
    AdditionalType::{Episode, Track},
    CurrentPlaybackContext, Device, RepeatState, TrackId,
};
use rspotify::prelude::*;
use tauri::{command, State};

use crate::SpotifyState;

#[command]
pub async fn get_playback_state(
    state: State<'_, SpotifyState>,
) -> Result<Option<CurrentPlaybackContext>, String> {
    state
        .get_spotify()
        .current_playback(None, Some([&Track, &Episode]))
        .await
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn get_device_list(state: State<'_, SpotifyState>) -> Result<Vec<Device>, String> {
    state
        .get_spotify()
        .device()
        .await
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn set_device(
    device_id: String,
    state: State<'_, SpotifyState>,
) -> Result<String, String> {
    state
        .get_spotify()
        .transfer_playback(&device_id, None)
        .await
        .map(|_| device_id)
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn set_volume(volume_percent: u8, state: State<'_, SpotifyState>) -> Result<u8, String> {
    state
        .get_spotify()
        .volume(volume_percent, None)
        .await
        .map(|_| volume_percent)
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn set_playing(play_state: bool, state: State<'_, SpotifyState>) -> Result<bool, String> {
    let result = if play_state {
        state.get_spotify().resume_playback(None, None).await
    } else {
        state.get_spotify().pause_playback(None).await
    };

    result.map(|_| play_state).map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn previous_track(state: State<'_, SpotifyState>) -> Result<(), String> {
    state
        .get_spotify()
        .previous_track(None)
        .await
        .map(|_| ())
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn seek(progress: u32, state: State<'_, SpotifyState>) -> Result<u32, String> {
    let duration = chrono::Duration::milliseconds(progress.into());
    state
        .get_spotify()
        .seek_track(duration, None)
        .await
        .map(|_| progress)
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn next_track(state: State<'_, SpotifyState>) -> Result<(), String> {
    state
        .get_spotify()
        .next_track(None)
        .await
        .map(|_| ())
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn set_shuffle(
    shuffle_state: bool,
    state: State<'_, SpotifyState>,
) -> Result<bool, String> {
    state
        .get_spotify()
        .shuffle(shuffle_state, None)
        .await
        .map(|_| shuffle_state)
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn set_repeat(
    repeat_state: RepeatState,
    state: State<'_, SpotifyState>,
) -> Result<RepeatState, String> {
    state
        .get_spotify()
        .repeat(repeat_state, None)
        .await
        .map(|_| repeat_state)
        .map_err(|e| format!("{:#?}", e))
}

#[command]
pub async fn check_liked(track_id: String, state: State<'_, SpotifyState>) -> Result<bool, String> {
    let limit = 50;
    let mut offset = 0;
    let spotify = state.get_spotify();

    while let Ok(page) = spotify
        .current_user_saved_tracks_manual(None, Some(limit), Some(offset))
        .await
    {
        for item in page.items {
            if item.track.is_local {
                return Err("Track is local, cannot save it.".to_string());
            }
            if item.track.id.unwrap().id() == track_id {
                return Ok(true);
            }
        }
        if page.next.is_none() {
            return Ok(false);
        }
        offset += limit;
    }
    Ok(false)
}

#[command]
pub async fn set_liked(
    track_id: String,
    liked_state: bool,
    state: State<'_, SpotifyState>,
) -> Result<bool, String> {
    let out = if liked_state {
        state
            .get_spotify()
            .current_user_saved_tracks_delete(vec![TrackId::from_id(&track_id).unwrap()])
            .await
    } else {
        state
            .get_spotify()
            .current_user_saved_tracks_add(vec![TrackId::from_id(&track_id).unwrap()])
            .await
    };
    out.map(|_| liked_state).map_err(|e| format!("{:#?}", e))
}
