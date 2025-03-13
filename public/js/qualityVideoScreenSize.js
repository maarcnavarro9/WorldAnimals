document.addEventListener("DOMContentLoaded", () => {
    const qualitySelector = document.getElementById("qualitySelector");
    const videoElement = document.getElementById("myVideo");
    const sourceMp4 = document.getElementById("sourceMp4");
    const sourceWebm = document.getElementById("sourceWebm");

    function updateQuality() {
        let quality = "4K";

        if (window.matchMedia("(max-width: 799px)").matches) {
            quality = "720p";
        } else if (window.matchMedia("(min-width: 800px) and (max-width: 1199px)").matches) {
            quality = "FullHD";
        }

        qualitySelector.value = quality;

        sourceMp4.src = `./assets/videos/WorldAnimalsV1_${quality}.mp4`;
        sourceWebm.src = `./assets/videos/WorldAnimalsV1_${quality}.webm`;

        videoElement.load();
    }

    updateQuality();

    window.matchMedia("(max-width: 799px)").addEventListener("change", updateQuality);
    window.matchMedia("(min-width: 800px) and (max-width: 1199px)").addEventListener("change", updateQuality);
    window.matchMedia("(min-width: 1200px)").addEventListener("change", updateQuality);
});
