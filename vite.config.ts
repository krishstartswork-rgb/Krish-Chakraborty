import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const SLOT_ORDER = [
  'altdrx-cover',
  'altdrx-tv',
  'altdrx-billboard',
  'altdrx-social',
  'altdrx-product',
  'adbabu-cover',
  'adbabu-case-1',
  'adbabu-case-2',
  'adbabu-case-3',
  'adbabu-case-4',
  'adbabu-team',
  'campaigns-cover',
  'content-cover',
  'content-food-2019',
  'content-kathaa',
  'content-video',
  'content-ai',
  'lead-jagsom',
  'lead-kanyathon',
  'lead-rotaract',
  'lead-nshm',
  'award-adtract',
  'award-marksman',
  'award-markshetra',
  'award-medgala',
  'award-adspoof',
];

interface AssetEntry {
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
}

interface ExperimentsEntry {
  notesTitle: string;
  notesText: string;
  hasCustomNotes: boolean;
  reelVideoUrl: string;
  reelExternalUrl: string;
}

interface ManifestData {
  assets: Record<string, AssetEntry>;
  experiments: ExperimentsEntry;
}

const DEFAULT_EXPERIMENTS: ExperimentsEntry = {
  notesTitle: 'NOTES & WRITING',
  notesText:
    'Notes, essays, and behind-the-scenes thoughts live here once added to src/data/siteAssetsData.json.',
  hasCustomNotes: false,
  reelVideoUrl: '',
  reelExternalUrl: '',
};

const PORTFOLIO_DIR = path.resolve(__dirname, 'public/assets/portfolio');
const DATA_JSON_PATH = path.resolve(__dirname, 'src/data/siteAssetsData.json');

function syncDiskFilesIntoManifest(manifest: ManifestData): void {
  if (!fs.existsSync(PORTFOLIO_DIR)) return;
  const files = fs.readdirSync(PORTFOLIO_DIR);
  for (const file of files) {
    if (file === 'README.txt') continue;
    if (file.startsWith('experiments-reel.')) {
      if (!manifest.experiments.reelVideoUrl) {
        manifest.experiments.reelVideoUrl = `/assets/portfolio/${file}`;
      }
      continue;
    }
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'].includes(ext)) continue;
    const slotId = path.basename(file, ext);
    if (!/^[a-z0-9-]+$/i.test(slotId)) continue;
    const entry = (manifest.assets[slotId] = manifest.assets[slotId] || {});
    if (!entry.imageUrl) {
      entry.imageUrl = `/assets/portfolio/${file}`;
    }
  }
}

function readCurrentManifest(): ManifestData {
  const assetMap: Record<string, AssetEntry> = {};
  for (const key of SLOT_ORDER) {
    assetMap[key] = {};
  }
  let experiments: ExperimentsEntry = {...DEFAULT_EXPERIMENTS};

  if (fs.existsSync(DATA_JSON_PATH)) {
    const raw = fs.readFileSync(DATA_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ManifestData>;
    if (parsed.assets && typeof parsed.assets === 'object') {
      for (const [k, v] of Object.entries(parsed.assets)) {
        assetMap[k] = {...(assetMap[k] || {}), ...v};
      }
    }
    if (parsed.experiments && typeof parsed.experiments === 'object') {
      experiments = {...experiments, ...parsed.experiments};
    }
  }

  const manifest: ManifestData = {assets: assetMap, experiments};
  syncDiskFilesIntoManifest(manifest);
  return manifest;
}

function writeManifest(manifest: ManifestData): void {
  fs.writeFileSync(DATA_JSON_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function readJsonBody(
  req: IncomingMessage,
  maxBytes = 120 * 1024 * 1024,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;

    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > maxBytes) {
        req.destroy();
        reject(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', reject);
  });
}

function saveImageRecord(
  rec: {
    slotId?: string;
    dataUrl?: string;
    linkUrl?: string;
    linkLabel?: string;
  },
  assetMap: Record<string, AssetEntry>,
): {savedImage: boolean; savedLink: boolean} {
  if (!rec?.slotId || !/^[a-z0-9-]+$/i.test(rec.slotId)) {
    return {savedImage: false, savedLink: false};
  }
  const entry = (assetMap[rec.slotId] = assetMap[rec.slotId] || {});
  let savedImage = false;
  let savedLink = false;

  if (typeof rec.dataUrl === 'string') {
    const match = rec.dataUrl.match(
      /^data:image\/([a-zA-Z0-9+.-]+);(?:[^,]*;)?base64,([\s\S]+)$/,
    );
    if (match) {
      const sub = match[1].toLowerCase();
      const ext =
        sub === 'jpeg' ? 'jpg' : sub === 'svg+xml' ? 'svg' : sub.replace(/[^a-z0-9]/g, '') || 'png';
      const fileName = `${rec.slotId}.${ext}`;
      const outPath = path.join(PORTFOLIO_DIR, fileName);
      const base64Clean = match[2].replace(/\s+/g, '');
      fs.writeFileSync(outPath, Buffer.from(base64Clean, 'base64'));
      entry.imageUrl = `/assets/portfolio/${fileName}`;
      savedImage = true;
    }
  }

  if (typeof rec.linkUrl === 'string' && /^https?:\/\//i.test(rec.linkUrl.trim())) {
    entry.linkUrl = rec.linkUrl.trim();
    savedLink = true;
  }
  if (typeof rec.linkLabel === 'string' && rec.linkLabel.trim()) {
    entry.linkLabel = rec.linkLabel.trim();
  }

  return {savedImage, savedLink};
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function attachRecoveryMiddleware(
  middlewares: {
    use: (
      route: string,
      handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
    ) => void;
  },
): void {
  middlewares.use('/__recover-ping', (_req, res) => {
    sendJson(res, 200, {ok: true, dev: true});
  });

  middlewares.use('/__recover-item', (req, res) => {
    if (req.method !== 'POST') {
      sendJson(res, 405, {ok: false, error: 'Method not allowed'});
      return;
    }
    readJsonBody(req)
      .then((raw) => {
        const body = raw as {
          asset?: {
            slotId?: string;
            dataUrl?: string;
            linkUrl?: string;
            linkLabel?: string;
          };
          experiments?: {
            notesText?: string;
            reelExternalUrl?: string;
            reelDataUrl?: string;
            reelChunkBase64?: string;
            reelExt?: string;
            reelChunkIndex?: number;
            reelTotalChunks?: number;
          };
        };

        fs.mkdirSync(PORTFOLIO_DIR, {recursive: true});
        const manifest = readCurrentManifest();

        let savedImage = false;
        let savedLink = false;
        if (body.asset) {
          const resSave = saveImageRecord(body.asset, manifest.assets);
          savedImage = resSave.savedImage;
          savedLink = resSave.savedLink;
        }

        if (body.experiments) {
          if (body.experiments.notesText && body.experiments.notesText.trim()) {
            manifest.experiments.notesText = body.experiments.notesText;
            manifest.experiments.hasCustomNotes = true;
          }
          if (
            body.experiments.reelExternalUrl &&
            /^https?:\/\//i.test(body.experiments.reelExternalUrl.trim())
          ) {
            manifest.experiments.reelExternalUrl = body.experiments.reelExternalUrl.trim();
            if (!manifest.experiments.reelVideoUrl) {
              manifest.experiments.reelVideoUrl = manifest.experiments.reelExternalUrl;
            }
          }
          if (typeof body.experiments.reelDataUrl === 'string') {
            const vMatch = body.experiments.reelDataUrl.match(
              /^data:video\/([a-zA-Z0-9+.-]+);(?:[^,]*;)?base64,([\s\S]+)$/,
            );
            if (vMatch) {
              const sub = vMatch[1].toLowerCase();
              const ext = sub === 'quicktime' ? 'mov' : sub.replace(/[^a-z0-9]/g, '') || 'mp4';
              const fileName = `experiments-reel.${ext}`;
              fs.writeFileSync(
                path.join(PORTFOLIO_DIR, fileName),
                Buffer.from(vMatch[2].replace(/\s+/g, ''), 'base64'),
              );
              manifest.experiments.reelVideoUrl = `/assets/portfolio/${fileName}`;
            }
          }
          if (
            typeof body.experiments.reelChunkBase64 === 'string' &&
            typeof body.experiments.reelChunkIndex === 'number'
          ) {
            const safeExt = (body.experiments.reelExt || 'mp4').replace(/[^a-z0-9]/gi, '') || 'mp4';
            const fileName = `experiments-reel.${safeExt}`;
            const targetPath = path.join(PORTFOLIO_DIR, fileName);
            const buf = Buffer.from(body.experiments.reelChunkBase64, 'base64');
            if (body.experiments.reelChunkIndex === 0) {
              fs.writeFileSync(targetPath, buf);
            } else {
              fs.appendFileSync(targetPath, buf);
            }
            if (
              body.experiments.reelTotalChunks &&
              body.experiments.reelChunkIndex + 1 >= body.experiments.reelTotalChunks
            ) {
              manifest.experiments.reelVideoUrl = `/assets/portfolio/${fileName}`;
            }
          }
        }

        writeManifest(manifest);
        sendJson(res, 200, {ok: true, savedImage, savedLink});
      })
      .catch((err) => {
        sendJson(res, 500, {
          ok: false,
          error: err instanceof Error ? err.message : 'Recovery item failed',
        });
      });
  });
}

function devAssetRecoveryPlugin(): Plugin {
  return {
    name: 'dev-asset-recovery',
    configureServer(server) {
      attachRecoveryMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachRecoveryMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      devAssetRecoveryPlugin(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify--file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
