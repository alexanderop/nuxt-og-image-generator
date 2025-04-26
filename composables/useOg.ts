import satori, { init as initSatori, type FontWeight, type FontStyle } from 'satori/wasm'
import initYoga from 'yoga-wasm-web'
import { Resvg, initWasm as initResvg } from '@resvg/resvg-wasm'
import { saveAs } from 'file-saver'
import { ref, watchEffect, type Ref } from 'vue'

// Vite will copy the WASM binaries and give you their URLs
import yogaWasmUrl   from 'yoga-wasm-web/dist/yoga.wasm?url'
import resvgWasmUrl  from '@resvg/resvg-wasm/index_bg.wasm?url'
import fontUrl       from '~/assets/fonts/Inter_Regular.ttf?url'

// Log the URLs to check them
if (import.meta.client) {
  console.log('[useOg] Yoga WASM URL:', yogaWasmUrl);
  console.log('[useOg] Resvg WASM URL:', resvgWasmUrl);
  console.log('[useOg] Font URL:', fontUrl);
}

let wasmReady: Promise<void> | null = null
function ensureWasm () {
  // Ensure this only runs on the client
  if (!import.meta.client) {
    console.error('[useOg] WASM initialization cannot run on the server.');
    return Promise.reject(new Error('WASM initialization can only run on the client.'));
  }

  if (!wasmReady) {
    console.log('[useOg] Initializing WASM...');
    wasmReady = Promise.all([
      // Yoga for Satori
      fetch(yogaWasmUrl).then(r => {
        console.log('[useOg] Yoga WASM fetched status:', r.status);
        if (!r.ok) throw new Error(`Failed to fetch Yoga WASM: ${r.statusText}`);
        return r.arrayBuffer();
      }).then(buf => {
        console.log('[useOg] Yoga WASM buffer received, initializing Yoga...');
        return initYoga(buf);
      }).then(yoga => {
        console.log('[useOg] Yoga initialized, initializing Satori...');
        return initSatori(yoga);
      }),
      // Resvg renderer
      fetch(resvgWasmUrl).then(r => {
        console.log('[useOg] Resvg WASM fetched status:', r.status);
        if (!r.ok) throw new Error(`Failed to fetch Resvg WASM: ${r.statusText}`);
        return r.arrayBuffer();
      }).then(buf => {
         console.log('[useOg] Resvg WASM buffer received, initializing Resvg...');
         return initResvg(buf);
      })
    ]).then(() => {
      console.log('[useOg] WASM Initialized successfully!');
      return void 0; // Explicitly return void for Promise<void>
    }).catch(err => {
      console.error('[useOg] WASM Initialization failed:', err);
      wasmReady = null; // Reset promise so it can be retried
      throw err; // Rethrow to propagate the error
    });
  } else {
      console.log('[useOg] WASM already initializing or ready.');
  }
  return wasmReady;
}

// Interface for customization options
interface OgOptions {
  backgroundColor?: string;
  textColor?: string;
  titleFontSize?: number;
}

export const useOg = () => {
  const gen = async (title: string, tag = ''): Promise<Blob> => {
    // Ensure this only runs on the client
    if (!import.meta.client) {
      console.error('[useOg gen] Cannot generate OG image on the server.');
      // Return an empty blob or throw an error, depending on desired behavior
      return new Blob();
    }

    console.log('[useOg gen] Starting generation for:', { title, tag });

    try {
      console.log('[useOg gen] Ensuring WASM is ready...');
      await ensureWasm();
      console.log('[useOg gen] WASM is ready.');

      // Removed the 50ms delay for now
      // await new Promise(resolve => setTimeout(resolve, 50));

      console.log('[useOg gen] Fetching font data...');
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
          throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
      }
      const fontData = await fontResponse.arrayBuffer();
      console.log('[useOg gen] Font data fetched successfully.');

      const satoriOptions = {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Inter', data: fontData, weight: 400 as FontWeight, style: 'normal' as FontStyle }]
      };
      const element = {
        type: 'div',
        props: {
          style: {
            width: 1200, height: 630, display: 'flex',
            flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg,#1d4ed8,#9333ea)',
            color: 'white', fontSize: 64, padding: 80
          },
          children: [
            { type: 'span', props: { children: title } },
            tag && { type: 'span', props: { style: { fontSize: 32, marginTop: 32 }, children: tag } }
          ].filter(Boolean) // Ensure only valid children are passed
        }
      };

      console.log('[useOg gen] Calling satori with options:', satoriOptions);
      console.log('[useOg gen] Calling satori with element:', JSON.stringify(element).substring(0, 200) + '...'); // Log partial element
      const svg = await satori(element, satoriOptions);
      console.log('[useOg gen] Satori finished. SVG length:', svg.length);
      // console.log('[useOg gen] SVG Output:', svg); // Optional: Log full SVG if needed, can be large

      console.log('[useOg gen] Initializing Resvg with SVG...');
      const resvg = new Resvg(svg);
      console.log('[useOg gen] Rendering PNG...');
      const pngData = resvg.render().asPng();
      console.log('[useOg gen] PNG rendering finished. PNG data size:', pngData.byteLength);

      const blob = new Blob([pngData], { type: 'image/png' });
      console.log('[useOg gen] Blob created:', blob);
      return blob;

    } catch (error) {
      console.error('[useOg gen] Error during image generation:', error);
      // Depending on how you want to handle errors, you could:
      // 1. Rethrow the error:
      throw error;
      // 2. Return a specific error indicator (like an empty blob or null):
      // return new Blob();
      // return null; // Adjust function signature if returning null
    }
  }

  const download = async (title: string, tag = '') => {
      console.log('[useOg download] Starting download for:', { title, tag });
      try {
          const blob = await gen(title, tag);
          // Ensure blob is not null/empty if gen might return that on error
          if (blob && blob.size > 0) {
              console.log('[useOg download] Blob received, initiating saveAs...');
              saveAs(blob, 'og.png');
              console.log('[useOg download] saveAs called.');
          } else {
              console.error('[useOg download] Received invalid blob from gen function.');
              // Handle invalid blob case, maybe show a user notification
          }
      } catch (error) {
          console.error('[useOg download] Error during download process:', error);
          // Handle download error, maybe show a user notification
      }
  }

  // --- New function for Client-Side Preview --- //
  const generatePreviewDataUrl = (title: Ref<string>, tag: Ref<string>): Ref<string> => {
    const previewDataUrl = ref('');
    let fontDataCache: ArrayBuffer | null = null;

    watchEffect(async () => {
      // Ensure this only runs on the client
      if (!import.meta.client) return;

      const currentTitle = title.value;
      const currentTag = tag.value;

      // Debounce or prevent rapid updates if needed
      // previewDataUrl.value = ''; // Optional: Clear preview while generating
      console.log('[useOg preview] Generating preview for:', { currentTitle, currentTag });

      try {
        console.log('[useOg preview] Ensuring WASM is ready...');
        await ensureWasm();
        console.log('[useOg preview] WASM is ready.');

        // Fetch font only once
        if (!fontDataCache) {
          console.log('[useOg preview] Fetching font data...');
          const fontResponse = await fetch(fontUrl);
          if (!fontResponse.ok) {
              throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
          }
          fontDataCache = await fontResponse.arrayBuffer();
          console.log('[useOg preview] Font data fetched and cached.');
        }

        const satoriOptions = {
          width: 1200,
          height: 630,
          fonts: [{ name: 'Inter', data: fontDataCache, weight: 400 as FontWeight, style: 'normal' as FontStyle }]
        };
        const element = {
          type: 'div',
          props: {
            style: {
              width: 1200, height: 630, display: 'flex',
              flexDirection: 'column', justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg,#1d4ed8,#9333ea)',
              color: 'white', fontSize: 64, padding: 80,
              fontFamily: 'Inter'
            },
            children: [
              { type: 'span', props: { children: currentTitle || ' ' } }, // Use non-empty string for title
              currentTag && { type: 'span', props: { style: { fontSize: 32, marginTop: 32 }, children: currentTag } }
            ].filter(Boolean)
          }
        };

        console.log('[useOg preview] Calling satori...');
        const svg = await satori(element, satoriOptions);
        console.log('[useOg preview] Satori finished.');

        // Convert SVG to Base64 Data URL
        const base64Svg = btoa(unescape(encodeURIComponent(svg)));
        previewDataUrl.value = `data:image/svg+xml;base64,${base64Svg}`;
        console.log('[useOg preview] Preview Data URL updated.');

      } catch (error) {
        console.error('[useOg preview] Error during preview generation:', error);
        previewDataUrl.value = ''; // Clear preview on error
      }
    });

    return previewDataUrl;
  }

  return { gen, download, generatePreviewDataUrl }
} 