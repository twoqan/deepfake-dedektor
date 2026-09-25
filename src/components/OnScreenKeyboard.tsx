'use client';

import { motion } from 'framer-motion';

const ROWS: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
];

interface OnScreenKeyboardProps {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  disabled?: boolean;
}

const keyBase =
  'select-none rounded-xl border font-semibold text-white transition-colors active:scale-95 disabled:opacity-40 disabled:active:scale-100';
const keyIdle =
  'bg-slate-800/70 border-slate-700/60 hover:bg-slate-700/80 active:bg-slate-600/80';

export default function OnScreenKeyboard({
  onKey,
  onBackspace,
  onSpace,
  disabled = false,
}: OnScreenKeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full" role="group" aria-label="Ekran klavyesi">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-3 w-full">
          {row.map((char) => (
            <motion.button
              key={char}
              type="button"
              whileTap={{ scale: 0.92 }}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onKey(char)}
              disabled={disabled}
              className={`${keyBase} ${keyIdle} h-20 w-24 max-w-[7.5vw] text-3xl`}
              aria-label={char}
            >
              {char}
            </motion.button>
          ))}
        </div>
      ))}

      <div className="flex justify-center gap-3 w-full mt-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onPointerDown={(e) => e.preventDefault()}
          onClick={onBackspace}
          className={`${keyBase} h-20 flex-[1] max-w-[18rem] bg-red-950/60 border-red-900/60 hover:bg-red-900/60 active:bg-red-800/60 text-xl flex items-center justify-center gap-2`}
          aria-label="Sil"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
          SİL
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onPointerDown={(e) => e.preventDefault()}
          onClick={onSpace}
          disabled={disabled}
          className={`${keyBase} ${keyIdle} h-20 flex-[2.6] max-w-[46rem] text-xl tracking-wide`}
          aria-label="Boşluk"
        >
          BOŞLUK
        </motion.button>
      </div>
    </div>
  );
}
