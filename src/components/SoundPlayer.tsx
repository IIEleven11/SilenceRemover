import { Component, Setter, Show, createSignal } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { addRegions, extractRegions } from "./SilentHelper";

export interface Region {
  start: number;
  end: number;
}

const SoundPlayer: Component<{
  videoUrl: string;
  setWavesurferRef: Setter<WaveSurfer>;
}> = (props) => {
  const [ready, setReady] = createSignal(false);

  const initWaveSurfer = (wavePlayerRef: HTMLElement) => {
    const ws = WaveSurfer.create({
      container: wavePlayerRef!,
      waveColor: "#b45309",
      progressColor: "#065f46",
      minPxPerSec: 50,
      url: props.videoUrl,
      // Set a bar width
      barWidth: 2,
      // Optionally, specify the spacing between bars
      barGap: 1,
      // And the bar radius
      barRadius: 1,
      normalize: true,
    });
    // Initialize the Timeline plugin
    ws.registerPlugin(Timeline.create());
    const wsRegions = ws.registerPlugin(RegionPlugin.create());

    ws.on("ready", () => {
      setReady(true);
    });

    // Create regions for each non-silent part of the audio
    ws.on("decode", (duration) => {
      const decodedData = ws.getDecodedData();
      if (decodedData) {
        const regions = extractRegions(decodedData.getChannelData(0), duration);
        addRegions(regions, wsRegions);
      }
    });

    props.setWavesurferRef(ws);
  };

  return (
    <div class="flex-auto text-center px-2 pt-1 pb-1 ring-2 ring-inset ring-slate-300 rounded-lg">
      <Show when={!ready()}>
        <div
          class="mt-12 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p class="text-sm text-slate-500">
          Give it like 10 seconds or so, bigger the file, longer the load,
          unless you got a very expensive pc, then I'm jealous
        </p>
      </Show>
      <div ref={initWaveSurfer}></div>
    </div>
  );
};

export default SoundPlayer;
