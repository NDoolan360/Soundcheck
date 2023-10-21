<div align="center">
  
![Logo](./public/icons/128x128@2x.png)

**Soundcheck**, a desktop Spotify mini player.

![Windows Support](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white) ![Ubuntu Support](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)<!-- ![Arch Linux Support](https://img.shields.io/badge/Arch_Linux-1793D1?style=for-the-badge&logo=arch-linux&logoColor=white) ![MacOS Support](https://img.shields.io/badge/MACOS-adb8c5?style=for-the-badge&logo=macos&logoColor=white) -->

![GitHub issues](https://img.shields.io/github/issues/ndoolan360/soundcheck) ![GitHub pull requests](https://img.shields.io/github/issues-pr/ndoolan360/soundcheck) ![Rust workflow](https://github.com/ndoolan360/soundcheck/actions/workflows/rust.yml/badge.svg) ![Rust workflow](https://github.com/ndoolan360/soundcheck/actions/workflows/npm.yml/badge.svg)

</div>

---

## Development

If you want to run this project on your local system, see below.

### Prerequisites

Before you start, make sure you have the following prerequisites installed:

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/)
-   [Rust](https://www.rust-lang.org/)

You can find more detailed information about the prerequisites in the [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites).

### Getting started

To get started with development, follow these steps:

1. Fork this project.
2. Clone the repository to your local machine.

```shell
$ git clone https://github.com/<your_github_username>/soundcheck.git
$ cd soundcheck
```

3. Install project dependencies using [`npm`](https://www.npmjs.com/):

```bash
$ npm install
```

4. Run the project in development mode.

```bash
$ npm run dev
```

### Building

To build a production version of the app, follow these steps:

1. Create an app in the Spotify for Developers Dashboard ([Guide](https://developer.spotify.com/documentation/web-api/tutorials/getting-started?offset=-165#create-an-app))
2. Include your client id and the port of your localhost redirect uri in a `.env` file in the root directory.

```env
SPOTIFY_CLIENT_ID=<your spotify client id>
SPOTIFY_REDIRECT_URI=http://localhost:<port number>
```

3. Create the production version of your app:

```bash
$ npm run build
```

It will detect your operating system and build a bundle accordingly. The result will be located in `src-tauri/target/release`.
For more information about building applications for different platforms check out [the official documentation](https://tauri.app/v1/guides/building/)

#### Build-time Options

Options specified in the `.env` file that determine varying behaviour of builds.

-   `REFRESH_RATE`: The frequency that the playback state is refreshed (in ms). [Default: `5000`]

## License

[MIT](https://github.com/ndoolan360/soundcheck/blob/master/LICENSE)
