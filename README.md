# Spotlite

A desktop spotify mini player.

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

Make sure to have a `.env` file in the root directory containing:

```text
RSPOTIFY_CLIENT_ID=<your spotify client id>
RSPOTIFY_REDIRECT_URI=http://localhost:<port number>
```

It will detect your operating system and build a bundle accordingly. The result will be located in `src-tauri/target/release`.

For more information about building applications for different platforms check out [the official documentation](https://tauri.app/v1/guides/building/)
