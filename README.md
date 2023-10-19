# Soundcheck

A desktop spotify mini player.

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server by running:

```bash
npm run dev
```

## Building

After creating an app in the Spotify for Developers Dashboard ([Guide](https://developer.spotify.com/documentation/web-api/tutorials/getting-started?offset=-165#create-an-app)), include your client id and redirect uri in a `.env` file in the root directory.
(Make sure your redirect URI has protocol and host, `http` and `localhost` respectively.)

```env
SPOTIFY_CLIENT_ID=<your spotify client id>
SPOTIFY_REDIRECT_URI=http://localhost:<port number>
```

Then to create the production version of your app run:

```bash
npm run build
```

It will detect your operating system and build a bundle accordingly. The result will be located in `src-tauri/target/release`.

For more information about building applications for different platforms check out [the official documentation](https://tauri.app/v1/guides/building/)

### Build-time Options

Options specified in the `.env` file that varying dictate behaviour of builds.

-   `REFRESH_RATE`: The frequency that the playback state is refreshed (in ms). Default: `5000`

## Recommended IDE Setup

-   [VS Code](https://code.visualstudio.com/)
-   [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
-   [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
-   [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
