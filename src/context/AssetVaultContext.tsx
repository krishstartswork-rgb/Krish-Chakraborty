import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  StoredAssetRecord,
  clearAllStoredAssets,
  deleteStoredAsset,
  getAllStoredAssets,
  readFileAsOptimizedDataUrl,
  saveStoredAsset,
} from '../utils/assetVault';

interface AssetVaultContextValue {
  assets: Record<string, StoredAssetRecord>;
  isReady: boolean;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uploadToSlot: (slotId: string, file: File, caption?: string) => Promise<void>;
  updateSlotCaption: (slotId: string, caption: string) => Promise<void>;
  updateSlotLink: (slotId: string, linkUrl: string, linkLabel?: string) => Promise<void>;
  removeSlotLink: (slotId: string) => Promise<void>;
  removeFromSlot: (slotId: string) => Promise<void>;
  clearVault: () => Promise<void>;
  exportVaultJson: () => void;
  importVaultJson: (file: File) => Promise<number>;
}

const AssetVaultContext = createContext<AssetVaultContextValue | null>(null);

export function AssetVaultProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Record<string, StoredAssetRecord>>({});
  const [isReady, setIsReady] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getAllStoredAssets().then((records) => {
      if (active) {
        setAssets(records);
        setIsReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const uploadToSlot = useCallback(async (slotId: string, file: File, caption?: string) => {
    const dataUrl = await readFileAsOptimizedDataUrl(file);
    setAssets((prev) => {
      const existing = prev[slotId];
      const record: StoredAssetRecord = {
        ...existing,
        slotId,
        dataUrl,
        fileName: file.name,
        caption: caption ?? existing?.caption ?? '',
        updatedAt: Date.now(),
      };
      void saveStoredAsset(record);
      return { ...prev, [slotId]: record };
    });
  }, []);

  const updateSlotCaption = useCallback(
    async (slotId: string, caption: string) => {
      const existing = assets[slotId];
      if (!existing) return;
      const updated: StoredAssetRecord = {
        ...existing,
        caption,
        updatedAt: Date.now(),
      };
      await saveStoredAsset(updated);
      setAssets((prev) => ({ ...prev, [slotId]: updated }));
    },
    [assets],
  );

  const updateSlotLink = useCallback(
    async (slotId: string, linkUrl: string, linkLabel?: string) => {
      const existing = assets[slotId];
      const updated: StoredAssetRecord = {
        ...existing,
        slotId,
        linkUrl: linkUrl.trim(),
        linkLabel: linkLabel?.trim() || existing?.linkLabel || '',
        updatedAt: Date.now(),
      };
      await saveStoredAsset(updated);
      setAssets((prev) => ({ ...prev, [slotId]: updated }));
    },
    [assets],
  );

  const removeSlotLink = useCallback(
    async (slotId: string) => {
      const existing = assets[slotId];
      if (!existing) return;
      if (existing.dataUrl) {
        const updated: StoredAssetRecord = {
          ...existing,
          linkUrl: undefined,
          linkLabel: undefined,
          updatedAt: Date.now(),
        };
        await saveStoredAsset(updated);
        setAssets((prev) => ({ ...prev, [slotId]: updated }));
      } else {
        await deleteStoredAsset(slotId);
        setAssets((prev) => {
          const next = { ...prev };
          delete next[slotId];
          return next;
        });
      }
    },
    [assets],
  );

  const removeFromSlot = useCallback(
    async (slotId: string) => {
      const existing = assets[slotId];
      if (existing?.linkUrl) {
        const updated: StoredAssetRecord = {
          slotId,
          linkUrl: existing.linkUrl,
          linkLabel: existing.linkLabel,
          updatedAt: Date.now(),
        };
        await saveStoredAsset(updated);
        setAssets((prev) => ({ ...prev, [slotId]: updated }));
      } else {
        await deleteStoredAsset(slotId);
        setAssets((prev) => {
          const next = { ...prev };
          delete next[slotId];
          return next;
        });
      }
    },
    [assets],
  );

  const clearVault = useCallback(async () => {
    await clearAllStoredAssets();
    setAssets({});
  }, []);

  const exportVaultJson = useCallback(() => {
    const payload = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        assets,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krish-portfolio-assets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [assets]);

  const importVaultJson = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as { assets?: Record<string, StoredAssetRecord> };
    const incoming = parsed?.assets ?? {};
    const entries = Object.values(incoming);
    let importedCount = 0;
    for (const rec of entries) {
      if (rec && rec.slotId && (rec.dataUrl || rec.linkUrl)) {
        await saveStoredAsset(rec);
        importedCount += 1;
      }
    }
    const refreshed = await getAllStoredAssets();
    setAssets(refreshed);
    return importedCount;
  }, []);

  return (
    <AssetVaultContext.Provider
      value={{
        assets,
        isReady,
        editMode,
        setEditMode,
        drawerOpen,
        setDrawerOpen,
        uploadToSlot,
        updateSlotCaption,
        updateSlotLink,
        removeSlotLink,
        removeFromSlot,
        clearVault,
        exportVaultJson,
        importVaultJson,
      }}
    >
      {children}
    </AssetVaultContext.Provider>
  );
}

export function useAssetVault() {
  const ctx = useContext(AssetVaultContext);
  if (!ctx) {
    throw new Error('useAssetVault must be used within AssetVaultProvider');
  }
  return ctx;
}
