import React, { useRef } from 'react';
import { audio } from '../utils/audio';
import MechanicalButton from './MechanicalButton';

interface MenuProps {
  onClose: () => void;
  onOpenArchive: () => void;
  isBauhausMode: boolean;
  toggleBauhausMode: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  onRestartOnboarding: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
  onDevGenerate?: () => void;
  onClearData?: () => void;
}

const Menu: React.FC<MenuProps> = ({
  onClose,
  onOpenArchive,
  isBauhausMode,
  toggleBauhausMode,
  isSoundEnabled,
  toggleSound,
  onRestartOnboarding,
  onExportBackup,
  onImportBackup,
  onDevGenerate,
  onClearData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    audio.playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
    }
    // Reset so the same file can be picked again if needed
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col animate-in slide-in-from-left duration-300 font-sans text-[#121212]">

      {/* HEADER */}
      <div className="shrink-0 relative flex flex-col pt-safe-top z-20 border-b border-[#eae7e0] bg-[#F5F2EB]">
        <div className="w-full px-6 py-4 flex justify-between items-center relative z-30 shrink-0">
          <h2 className="text-4xl font-bold lowercase tracking-[-0.04em]">menu.</h2>
          <MechanicalButton
            onTrigger={() => {
              audio.playClick();
              onClose();
            }}
            scaleActive={0.85}
            className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors text-sm"
          >
            ✕
          </MechanicalButton>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-8 overflow-y-auto overflow-x-hidden p-6 pb-safe-bottom w-full">

        <MechanicalButton onTrigger={() => { audio.playClick(); onClose(); }} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
          <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">01</span>
          <span className="flex-1 text-2xl font-light uppercase tracking-widest group-active:translate-x-2 group-active:font-bold transition-all text-[#121212]">resume</span>
        </MechanicalButton>

        <MechanicalButton onTrigger={() => { audio.playClick(); toggleBauhausMode(); }} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
          <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">02</span>
          <div className="flex-1 flex items-center justify-between gap-4">
            <span className={`text-2xl uppercase tracking-widest text-[#121212] group-active:translate-x-2 transition-all ${isBauhausMode ? 'font-bold' : 'font-light'}`}>bauhaus mode</span>
            <div className={`w-12 h-6 border-2 border-[#121212] p-1 transition-colors ${isBauhausMode ? 'bg-[#121212]' : 'bg-transparent'}`}>
              <div className={`h-full w-1/2 bg-[#121212] transition-all ease-out ${isBauhausMode ? 'translate-x-full bg-white' : 'translate-x-0'}`} />
            </div>
          </div>
        </MechanicalButton>

        <MechanicalButton onTrigger={() => { if (!isSoundEnabled) audio.setMuted(false); audio.playClick(); toggleSound(); }} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
          <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">03</span>
          <div className="flex-1 flex items-center justify-between gap-4">
            <span className={`text-2xl uppercase tracking-widest text-[#121212] group-active:translate-x-2 transition-all ${isSoundEnabled ? 'font-bold' : 'font-light'}`}>sound</span>
            <div className={`w-12 h-6 border-2 border-[#121212] p-1 transition-colors ${isSoundEnabled ? 'bg-[#121212]' : 'bg-transparent'}`}>
              <div className={`h-full w-1/2 bg-[#121212] transition-all ease-out ${isSoundEnabled ? 'translate-x-full bg-white' : 'translate-x-0'}`} />
            </div>
          </div>
        </MechanicalButton>

        <MechanicalButton onTrigger={() => { audio.playClick(); onRestartOnboarding(); }} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
          <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">04</span>
          <span className="flex-1 text-2xl font-light uppercase tracking-widest group-active:translate-x-2 group-active:font-bold transition-all text-[#121212]">tutorial</span>
        </MechanicalButton>

        <MechanicalButton onTrigger={() => { audio.playClick(); onOpenArchive(); }} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
          <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">05</span>
          <span className="flex-1 text-2xl font-light uppercase tracking-widest group-active:translate-x-2 group-active:font-bold transition-all text-[#121212]">sessions</span>
        </MechanicalButton>

        {onExportBackup && (
          <MechanicalButton onTrigger={() => { audio.playClick(); onExportBackup(); }} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">06</span>
            <span className="flex-1 text-2xl font-light uppercase tracking-widest group-active:translate-x-2 group-active:font-bold transition-all text-[#121212]">export backup</span>
          </MechanicalButton>
        )}

        {onImportBackup && (
          <>
            <MechanicalButton onTrigger={handleImportClick} scaleActive={0.98} className="text-left group flex items-baseline gap-6 w-full">
              <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-active:text-[#121212]">07</span>
              <span className="flex-1 text-2xl font-light uppercase tracking-widest group-active:translate-x-2 group-active:font-bold transition-all text-[#121212]">import backup</span>
            </MechanicalButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />
          </>
        )}

        {/* Footer */}
        <div className="mt-auto pt-12 flex flex-col items-center gap-4">
          <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase opacity-30">
            V0.1
          </span>

          {/* DEV BUTTONS */}
          <div className="flex flex-row gap-2">
            {onDevGenerate && (
              <MechanicalButton
                onTrigger={() => {
                  onDevGenerate();
                  onOpenArchive();
                }}
                className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 px-2 py-1 opacity-50 hover:opacity-100"
              >
                [DEV] GENERATE x10
              </MechanicalButton>
            )}
            {onClearData && (
              <MechanicalButton
                onTrigger={onClearData}
                className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 px-2 py-1 opacity-50 hover:opacity-100"
              >
                CLEAR ALL DATA
              </MechanicalButton>
            )}
          </div>
        </div>

      </nav>
    </div>
  );
};

export default Menu;