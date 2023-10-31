export const MOCK_TRACK_SONG_LINK = 'https://open.spotify.com/track/5uuJruktM9fMdN9Va0DUMl';
export const MOCK_TRACK_DEEP_LINK = 'spotify://track/5uuJruktM9fMdN9Va0DUMl';
export const MOCK_EPISODE_SONG_LINK = 'https://open.spotify.com/episode/1zcBdrDgFKaCLfqYw0RM55';
export const MOCK_EPISODE_DEEP_LINK = 'spotify://episode/1zcBdrDgFKaCLfqYw0RM55';

export const MOCK_LIKED_SONGS = ['5uuJruktM9fMdN9Va0DUMl'];

export const MOCK_AUTH_DISALLOWS = {
    changeVolume: false,
    interruptingPlayback: false,
    link: false,
    playPause: false,
    seeking: false,
    skippingNext: false,
    skippingPrev: false,
    togglingLike: false,
    togglingRepeat: false,
    togglingShuffle: false,
    transferringPlayback: false,
};

export const MOCK_UNAUTH_DISALLOWS = {
    changeVolume: true,
    interruptingPlayback: true,
    link: true,
    playPause: true,
    seeking: true,
    skippingNext: true,
    skippingPrev: true,
    togglingLike: true,
    togglingRepeat: true,
    togglingShuffle: true,
    transferringPlayback: true,
};

export const MOCK_TRACK_STATE = {
    actions: {
        disallows: ['resuming'],
    },
    context: null,
    currently_playing_type: 'track',
    device: {
        id: 'test-device-id-1',
        is_active: true,
        is_private_session: false,
        is_restricted: false,
        name: 'test-device-name',
        type: 'Computer',
        volume_percent: 50,
    },
    is_playing: true,
    item: {
        album: {
            album_type: 'album',
            artists: [
                {
                    external_urls: {
                        spotify: 'https://open.spotify.com/artist/4apX9tIeHb85yPyy4F6FJG',
                    },
                    href: 'https://api.spotify.com/v1/artists/4apX9tIeHb85yPyy4F6FJG',
                    id: '4apX9tIeHb85yPyy4F6FJG',
                    name: 'Wild Cherry',
                },
            ],
            available_markets: ['AU'],
            external_urls: {
                spotify: 'https://open.spotify.com/album/27ompw8zlrCkWMacS21ysX',
            },
            href: 'https://api.spotify.com/v1/albums/27ompw8zlrCkWMacS21ysX',
            id: '27ompw8zlrCkWMacS21ysX',
            images: [
                {
                    height: 640,
                    url: 'https://i.scdn.co/image/ab67616d0000b273d419ed4f1e89669ce14bd369',
                    width: 640,
                },
                {
                    height: 300,
                    url: 'https://i.scdn.co/image/ab67616d00001e02d419ed4f1e89669ce14bd369',
                    width: 300,
                },
                {
                    height: 64,
                    url: 'https://i.scdn.co/image/ab67616d00004851d419ed4f1e89669ce14bd369',
                    width: 64,
                },
            ],
            name: 'Wild Cherry',
            release_date: '1976',
            release_date_precision: 'year',
        },
        artists: [
            {
                external_urls: {
                    spotify: 'https://open.spotify.com/artist/4apX9tIeHb85yPyy4F6FJG',
                },
                href: 'https://api.spotify.com/v1/artists/4apX9tIeHb85yPyy4F6FJG',
                id: '4apX9tIeHb85yPyy4F6FJG',
                name: 'Wild Cherry',
            },
        ],
        available_markets: ['AU'],
        disc_number: 1,
        duration_ms: 300000,
        explicit: false,
        external_ids: {
            isrc: 'USSM19912699',
        },
        external_urls: {
            spotify: 'https://open.spotify.com/track/5uuJruktM9fMdN9Va0DUMl',
        },
        href: 'https://api.spotify.com/v1/tracks/5uuJruktM9fMdN9Va0DUMl',
        id: '5uuJruktM9fMdN9Va0DUMl',
        is_local: false,
        name: 'Play That Funky Music',
        popularity: 73,
        preview_url:
            'https://p.scdn.co/mp3-preview/4b3c574d2e102bf5140c29d2934f2f0d5dc7bfcf?cid=72978abbb2fe4ea0851dbc51bc0363d5',
        track_number: 1,
    },
    progress_ms: 1680,
    repeat_state: 'track',
    shuffle_state: true,
    timestamp: 0,
};

export const MOCK_NOT_LIKED_TRACK_STATE = {
    item: {
        id: '5CuUKQ84YDMCfMRsGrLZfM',
    },
};

export const MOCK_EPISODE_STATE = {
    actions: {
        disallows: ['resuming'],
    },
    context: null,
    currently_playing_type: 'episode',
    device: {
        id: 'test-device-id-1',
        is_active: true,
        is_private_session: false,
        is_restricted: false,
        name: 'test-device-name',
        type: 'Computer',
        volume_percent: 50,
    },
    is_playing: true,
    item: {
        audio_preview_url:
            'https://podz-content.spotifycdn.com/audio/clips/5lIWaYwF13Ls9bHWT0aJCc/clip_1886700_1938900.mp3',
        description:
            'This is why we ended the Space Shuttle program Approachability: 6/10 (Lots of tension/release; but not very bloody at all) Content Warnings: Child death; Jump scares; Nail in foot; Some blood/gore Next Week�s Film� RandomHorror9 T-Shirts! Hosts: Jeffrey Cranor & Cecil Baldwin (Find more of our work on Welcome to Night Vale) Editing: Grant Stewart Logo: David Baldwin Random Horror 9 Patreon YouTube, Twitter, Letterboxd, & Instagram: @RandomHorror9 We are part of Night Vale Presents',
        duration_ms: 4890402,
        explicit: false,
        external_urls: {
            spotify: 'https://open.spotify.com/episode/1zcBdrDgFKaCLfqYw0RM55',
        },
        href: 'https://api.spotify.com/v1/episodes/1zcBdrDgFKaCLfqYw0RM55',
        id: '1zcBdrDgFKaCLfqYw0RM55',
        images: [
            {
                height: 640,
                url: 'https://i.scdn.co/image/ab6765630000ba8a6fa5bbd52842f9d3ebf875da',
                width: 640,
            },
            {
                height: 300,
                url: 'https://i.scdn.co/image/ab67656300005f1f6fa5bbd52842f9d3ebf875da',
                width: 300,
            },
            {
                height: 64,
                url: 'https://i.scdn.co/image/ab6765630000f68d6fa5bbd52842f9d3ebf875da',
                width: 64,
            },
        ],
        is_externally_hosted: false,
        is_playable: true,
        language: 'en',
        languages: ['en'],
        name: '181 - A Quiet Place (2018)',
        release_date: '2023-10-17',
        release_date_precision: 'day',
        resume_point: null,
        show: {
            available_markets: ['AU'],
            copyrights: [],
            description:
                'Helping to make horror films more approachable, one die roll at a time. Hosted by Jeffrey Cranor and Cecil Baldwin of Welcome to Night Vale.',
            explicit: false,
            external_urls: {
                spotify: 'https://open.spotify.com/show/266kb128AWroRESsTD01iu',
            },
            href: 'https://api.spotify.com/v1/shows/266kb128AWroRESsTD01iu',
            id: '266kb128AWroRESsTD01iu',
            images: [
                {
                    height: 640,
                    url: 'https://i.scdn.co/image/ab6765630000ba8adf1d856830d7cc23852c4ca0',
                    width: 640,
                },
                {
                    height: 300,
                    url: 'https://i.scdn.co/image/ab67656300005f1fdf1d856830d7cc23852c4ca0',
                    width: 300,
                },
                {
                    height: 64,
                    url: 'https://i.scdn.co/image/ab6765630000f68ddf1d856830d7cc23852c4ca0',
                    width: 64,
                },
            ],
            is_externally_hosted: false,
            languages: ['en'],
            media_type: 'audio',
            name: 'Random Number Generator Horror Podcast No. 9',
            publisher: 'Night Vale Presents',
        },
    },
    progress_ms: 25229,
    repeat_state: 'context',
    shuffle_state: false,
    timestamp: 0,
};

export const MOCK_DEVICE_LIST = [
    {
        id: 'test-device-id-1',
        is_active: true,
        is_private_session: false,
        is_restricted: false,
        name: 'test-device-name-1',
        type: 'Computer',
        volume_percent: 50,
    },
    {
        id: 'test-device-id-2',
        is_active: false,
        is_private_session: false,
        is_restricted: false,
        name: 'test-device-name-2',
        type: 'Computer',
        volume_percent: 50,
    },
];
