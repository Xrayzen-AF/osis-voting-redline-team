"use server";
 
import { createClient } from "@/utils/supabase/server";
 
export async function loginAdmin(formData: FormData) {
  const email = formData.get("username") as string;
  const password = formData.get("password") as string;
 
  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }
 
  try {
    const supabase = await createClient();
 
    // 1. Autentikasi akun ke Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
 
    if (authError) {
      return {
        success: false,
        error: "Kredensial salah atau akun tidak ditemukan.",
      };
    }
 
    // 2. Otorisasi: Periksa apakah user ID ini ada di tabel 'admins'
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("role")
      .eq("id", authData.user.id)
      .single();
 
    if (adminError || !adminData) {
      // Jika tidak terdaftar di tabel admin, paksa logout demi keamanan sistem
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akses ditolak. Anda bukan administrator resmi.",
      };
    }
 
    return { success: true, role: adminData.role };
  } catch (err) {
    console.error("Kesalahan sistem saat login admin:", err);
    return { success: false, error: "Terjadi kesalahan internal pada server." };
  }
}
 
// Fungsi logoutAdmin di sini
// ... (biarkan fungsi loginAdmin yang sudah ada di atasnya)
 
export async function logoutAdmin() {
  try {
	const supabase = await createClient();
	// Memerintahkan Supabase untuk menghapus sesi aktif
	await supabase.auth.signOut();
	return { success: true };
  } catch (err) {
	console.error("Kesalahan sistem saat logout:", err);
	return { success: false, error: "Gagal melakukan logout." };
  }
}
