// Util for converting a device type to a material icon
export const deviceToIcon = (device: SpotifyApi.UserDevice) => ((
    {
        unknown: 'device_unknown',
        computer: 'computer',
        tablet: 'tablet',
        smartphone: 'smartphone',
        speaker: 'speaker',
        tv: 'tv',
        avr: 'dvr',
        stb: 'router',
        audiodongle: 'settings_remote',
        gameconsole: 'sports_esports',
        castaudio: 'cast',
        castvideo: 'cast',
        automobile: 'directions_car',
        smartwatch: 'watch',
        chromebook: 'laptop_chromebook',
        unknownspotify: 'device_unknown',
        carthing: 'devices_other',
        observer: 'devices_other',
        homething: 'devices_other',
        undefined: 'portable_wifi_off'
    } as { [id: string]: string; }
)[device.type.toLowerCase().replaceAll(/[^a-z]/g, '')]);

// Util for converting raw times to pretty times
export const prettyTime = (rawTime: number) => {
    const date = new Date(rawTime);
    return date.getUTCHours() > 0
        ? date.toISOString().substring(11, 19)
        : date.toISOString().substring(14, 19);
};

// Util for transitioning repeat state
export const nextRepeat = (state: string) => state === 'off' ? 'context' : state === 'context' ? 'track' : 'off';
