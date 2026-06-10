Rancangan Sistem Pelacakan Scooter (Tracker) Berbasis React & Local Storage

1. Pendahuluan

Sistem ini adalah aplikasi pelacak status scooter sederhana yang berjalan di peramban (frontend React). Tidak ada form data penyewa – aplikasi hanya mencatat apakah sebuah scooter sedang tersedia atau sedang digunakan, serta menampilkan log aktivitas terbaru. Cocok untuk memantau perpindahan status scooter secara real-time di satu lokasi.

2. Tujuan dan Fitur Utama

· Toggle Status via QR Scan
    Memindai QR code scooter (kamera/galeri) untuk langsung mengubah status:
  · Jika tersedia → menjadi in-use (sedang dipakai).
  · Jika sedang dipakai → menjadi available (dikembalikan).
· Dashboard Pemantauan Real-Time
    Menampilkan status terkini semua scooter, ringkasan jumlah, dan log aktivitas terakhir.
· Dua Jenis Scooter
  · SD (Scooter Dewasa)
  · SJ (Scooter Jumbo)
      Jenis hanya sebagai atribut, tidak memengaruhi logika tracking.
· Penyimpanan Lokal (localStorage)
    Semua data (scooter & log) disimpan di peramban, tanpa backend.
· Tanpa Form Penyewa
    Tidak ada pencatatan identitas penyewa, durasi, atau biaya. Murni tracker status.

3. Arsitektur Sistem

Aplikasi React murni client-side. Navigasi menggunakan React Router.

```
+------------------+        +-------------------+
|   React App      |<------>|   localStorage    |
| (Dashboard,      |        |  - scooters[]     |
|  QR Scanner)     |        |  - activityLog[]  |
+------------------+        +-------------------+
```

4. Struktur Data di Local Storage

scooters : Array objek scooter

```json
[
  {
    "id": "SC001",
    "name": "Scooter 1",
    "type": "sd",
    "status": "available",
    "lastUpdated": "2026-06-10T09:00:00"
  }
]
```

· status : "available" atau "in-use"
· lastUpdated : timestamp terakhir kali status berubah

activityLog : Array log aktivitas

```json
[
  {
    "id": "log-1654321234",
    "scooterId": "SC001",
    "action": "checkout",
    "timestamp": "2026-06-10T09:00:00"
  }
]
```

· action : "checkout" (mulai digunakan) atau "return" (dikembalikan)

5. Alur Proses Utama

5.1 Scan QR untuk Toggle Status

1. Pengguna menekan tombol Scan di halaman utama.
2. Memilih metode:
   · Kamera – Membuka kamera langsung.
   · Galeri – Mengunggah gambar QR.
3. Sistem membaca scooterId dari QR.
4. Mencari scooter di localStorage:
   · Jika tidak ditemukan, tampilkan pesan error.
   · Jika ditemukan:
     · Status saat ini available → ubah ke in-use, catat log checkout.
     · Status saat ini in-use → ubah ke available, catat log return.
5. Tampilkan notifikasi sukses (misal: “Scooter SC001 sekarang sedang digunakan”).
6. Dashboard otomatis memperbarui tampilan.

5.2 Dashboard Pemantauan

Halaman utama (/) menampilkan:

· Ringkasan : jumlah scooter tersedia, sedang digunakan, total.
· Grid Status Scooter : kartu setiap scooter dengan:
  · Nama / ID
  · Jenis (SD/SJ)
  · Badge warna: hijau (available) / merah (in-use)
  · Waktu terakhir diubah (relatif, misal “2 menit lalu”)
· Log Aktivitas Terbaru : daftar 10 log terakhir (checkout/return) dengan timestamp.
· Tombol Scan QR yang mengarahkan ke halaman scanner.

5.3 Halaman Scanner (/scan)

· Komponen kamera + opsi unggah gambar.
· Setelah QR terdeteksi, langsung proses toggle status tanpa form.
· Menampilkan hasil (sukses/gagal) lalu kembali ke dashboard setelah beberapa detik atau dengan tombol.

6. Rancangan Antarmuka & Komponen React

6.1 Routes

Route Deskripsi
/ Dashboard utama
/scan Halaman pemindai QR

6.2 Komponen Utama

· Navbar : Judul aplikasi, navigasi ke Dashboard & Scan.
· DashboardStats : Kartu ringkasan (available, in-use, total).
· ScooterGrid : Grid kartu scooter dengan indikator status.
· ScooterCard : Menampilkan satu scooter, warna latar sesuai status.
· ActivityLog : Daftar log aktivitas terbaru.
· QRScanner : Komponen kamera (library html5-qrcode).
· QRImageUploader : Input file untuk membaca QR dari gambar.
· StatusToggleResult : Modal/toast notifikasi hasil scan.

6.3 State Management

Custom hook useLocalStorage untuk membaca/menulis data. State di-refresh setiap kali ada perubahan (baik dari scan maupun inisialisasi). Komponen dashboard mengambil data langsung dari localStorage saat mount dan saat menerima event storage (untuk sinkronisasi antar tab).

7. Teknologi & Library

· React (Vite)
· React Router DOM v6
· html5-qrcode (scan kamera & gambar)
· date-fns (format timestamp relatif)
· Tailwind CSS (styling cepat)
· Local Storage API murni

8. Batasan & Catatan

· Tanpa Data Penyewa – Hanya melacak status, tidak tahu siapa pemakai.
· Single Device – Data tidak tersinkron ke perangkat lain (kecuali satu browser).
· Backup Manual – Disarankan tambahkan tombol ekspor data (JSON) untuk jaga-jaga.
· Keamanan – Siapapun yang pegang perangkat bisa mengubah status, perlu pengawasan fisik.
· Multi-Tab – Gunakan event storage agar perubahan di satu tab langsung terlihat di tab lain.

9. Contoh Skenario Penggunaan

1. Petugas melihat dashboard: semua scooter hijau (available).
2. Pelanggan mengambil scooter SC005, petugas scan QR-nya.
3. Dashboard berubah: SC005 menjadi merah, log bertambah “SC005 dipakai”.
4. Saat scooter kembali, petugas scan ulang QR yang sama.
5. Status kembali hijau, log bertambah “SC005 dikembalikan”.

10. Kesimpulan

Sistem pelacakan ini sangat ringan, langsung pakai, dan memenuhi kebutuhan dasar pemantauan status scooter tanpa kerumitan data penyewa. Cocok untuk operasional rental kecil yang hanya perlu tahu scooter mana yang sedang di luar.
