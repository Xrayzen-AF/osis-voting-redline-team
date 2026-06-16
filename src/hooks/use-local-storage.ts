"use client";

import { useEffect, useState } from "react";

/**
 * useLocalStorage
 *
 * Bekerja seperti useState, tapi nilainya disimpan ke localStorage
 * sehingga tetap ada walau pindah halaman atau refresh browser.
 *
 * Catatan:
 * - Render pertama selalu memakai `initialValue` (sama di server & client)
 *   untuk menghindari hydration mismatch di Next.js.
 * - Setelah mount, hook ini membaca localStorage (jika ada) dan
 *   menimpa state dengan data yang tersimpan.
 * - Setiap kali `value` berubah (setelah load awal), nilainya
 *   otomatis ditulis kembali ke localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dari localStorage saat komponen pertama kali mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setValue(JSON.parse(saved) as T);
      }
    } catch {
      // localStorage tidak tersedia / data corrupt -> abaikan, pakai initialValue
    } finally {
      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Simpan ke localStorage setiap kali value berubah (setelah load awal selesai)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage tidak tersedia (mis. private mode penuh) -> abaikan
    }
  }, [key, value, isLoaded]);

  return [value, setValue] as const;
}