<script lang="ts">
    import { state } from "$lib/stores";

    let title = state.derive((state) => state?.item?.name ?? "");
    let subheading = state.derive((state) => {
        switch (state?.currently_playing_type) {
            case "track":
                return (state?.item as SpotifyApi.TrackObjectFull).artists
                    .map((a) => a.name)
                    .join(", ");
            case "episode":
                return (
                    (state?.item as SpotifyApi.EpisodeObject).show.name ?? ""
                );
        }
        return "";
    });
</script>

<hgroup class="left-align medium-line">
    <h1 class="large-text">{$title}</h1>
    <p class="medium-text">{$subheading}</p>
</hgroup>

<style>
    hgroup {
        flex: 1 1 auto;
        width: fit-content;
        overflow: hidden;
        mask-image: linear-gradient(90deg, #000 80%, transparent);
        -webkit-mask-image: linear-gradient(90deg, #000 80%, transparent);
    }
    hgroup > * {
        transform: scale(1.15) translateX(7.5%);
        white-space: nowrap;
    }
    hgroup > p {
        color: var(--outline);
    }
</style>
