Berdasarkan referensi desain pada file **image_8cc6e9.jpg**, berikut adalah *Product Requirements Document* (PRD) untuk halaman Admin Dashboard, khususnya pada modul Manajemen Klien (*Client Management*).

---

# Product Requirements Document (PRD): Admin Dashboard - Manajemen Klien

## 1. Ringkasan Eksekutif

Dokumen ini menguraikan spesifikasi fungsional dan desain untuk halaman *Dashboard* Admin (berdasarkan URL: `[shiptrack.com/clients](https://shiptrack.com/clients)`). Halaman ini berfungsi sebagai pusat kendali bagi administrator untuk melihat, mencari, menyaring (*filtering*), dan mengelola data klien/pengguna yang terdaftar di dalam sistem.

## 2. Tujuan (Objectives)

* Menyediakan tampilan data (*data table*) klien yang terstruktur, rapi, dan mudah dibaca.
* Memfasilitasi administrator untuk menemukan data spesifik dengan cepat melalui fitur pencarian global dan filter lanjutan (*advanced filtering*).
* Menyediakan akses cepat untuk tindakan administratif dasar seperti mengubah (*Edit*) atau menghapus (*Delete*) data klien.

## 3. Ruang Lingkup (Scope)

**Termasuk (In-Scope):**

* *Header* navigasi atas dengan pencarian global dan notifikasi.
* Tabel data klien dengan kolom: Email, Nomor Telepon, Tanggal Daftar, Tipe Akun, Status, dan Aksi.
* Fungsi *Sorting* (Pengurutan data).
* Fungsi *Filtering* (Penyaringan data) melalui *popover/modal* khusus dengan beberapa parameter.
* Tombol aksi (Edit & Delete) pada setiap baris data.

**Tidak Termasuk (Out-of-Scope):**

* Halaman detail klien (ketika baris di-klik).
* Sistem *backend* untuk notifikasi.
* Proses ekspor/impor data (belum terlihat di UI, diasumsikan di luar cakupan rilis ini).

---

## 4. Spesifikasi UI/UX (Berdasarkan image_8cc6e9.jpg)

### A. Navigasi Atas (Top Bar)

* **Global Search:** *Search bar* (kolom pencarian) dengan ikon kaca pembesar, terletak di sebelah kanan atas. Digunakan untuk pencarian cepat di seluruh modul dashboard.
* **Notifikasi:** Ikon lonceng (*bell*) di sebelah paling kanan untuk melihat pemberitahuan sistem.

### B. Action Bar (Bilah Aksi Tabel)

Terletak tepat di atas tabel data, rata kanan:

* **Tombol "Sort by":** Tombol dengan ikon panah atas/bawah untuk mengurutkan data tabel (misal: berdasarkan tanggal terbaru atau abjad).
* **Tombol "Filter":** Tombol dengan ikon *slider/toggle* yang jika diklik akan memunculkan menu *popover* Filter. Jika filter sedang aktif, tombol ini sebaiknya memiliki indikator (misal: perubahan warna atau tanda titik).

### C. Tabel Data (Data Table)

Tabel menampilkan daftar klien dengan desain baris yang bersih (latar belakang putih bergantian dengan abu-abu sangat muda/zebra cross, opsional).
**Kolom Tabel:**

1. **Email:** Menampilkan alamat email klien (dilengkapi ikon *checklist/shield* kecil di header).
2. **Phone number:** Menampilkan nomor kontak format internasional/spesifik (dilengkapi ikon telepon).
3. **Sign-up Date:** Format tanggal pendaftaran (YYYY-MM-DD) (dilengkapi ikon kalender).
4. **Account [Type]:** Jenis akun klien (contoh nilai: *Regular, Premium*).
5. **Status:** Indikator status klien (contoh nilai yang terlihat: *Pending, Active* dengan indikator titik warna).
6. **Aksi (Actions):** Muncul di sebelah kanan (seperti terlihat di bagian bawah gambar), berisi tombol:
* **Edit:** Ikon pensil + teks.
* **Delete:** Ikon tempat sampah + teks.



### D. Menu Popover "Filter"

Muncul melayang (*floating*) saat tombol Filter diklik. Terdiri dari beberapa seksi, di mana setiap seksi memiliki tombol "Reset" masing-masing di sudut kanan teks labelnya.

1. **Date range (Rentang Tanggal):**
* Kolom input "From:" dengan ikon kalender (*Date picker*).
* Kolom input "To:" dengan ikon kalender (*Date picker*).


2. **Activity type (Tipe Aktivitas / Kategori):**
* Menu *Dropdown*.
* *Default placeholder/value*: "All warehouses" (Disesuaikan dengan konteks logistik/pengiriman).


3. **Status:**
* Menu *Dropdown*.
* *Default/Selected value*: "Active" (ditandai dengan titik hijau).


4. **Keyword search:**
* Kolom input teks dengan ikon kaca pembesar. Berguna untuk mencari kata kunci spesifik hanya di dalam hasil filter.


5. **Footer Filter:**
* **Tombol "Reset all":** Tombol putih/transparan di kiri bawah untuk mengembalikan semua filter ke kondisi awal (kosong/default).
* **Tombol "Apply now":** Tombol utama berwarna *teal/hijau solid* di kanan bawah untuk mengeksekusi parameter filter ke tabel data.



---

## 5. User Stories

1. **Sebagai Admin**, saya ingin melihat daftar klien yang tersusun rapi dalam bentuk tabel agar saya bisa memantau pengguna terdaftar.
2. **Sebagai Admin**, saya ingin memfilter tabel berdasarkan *Date range* (tanggal pendaftaran) agar saya bisa melihat siapa saja yang mendaftar minggu ini.
3. **Sebagai Admin**, saya ingin memfilter tabel berdasarkan *Status* (misal: hanya melihat klien yang 'Active') untuk keperluan audit.
4. **Sebagai Admin**, saya ingin menghapus parameter filter tertentu menggunakan tombol "Reset" kecil di setiap kategori, atau mengulang semuanya dengan "Reset all".
5. **Sebagai Admin**, saya ingin dapat mengklik tombol "Edit" atau "Delete" pada baris klien tertentu untuk mengelola data mereka secara individual.

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

* **Fungsionalitas Tabel:**
* [ ] Tabel harus menampilkan data secara dinamis dari *database*.
* [ ] Pagination (pembagian halaman) atau *infinite scroll* harus diimplementasikan jika data melebihi batas tampilan (misal: 20 baris per halaman).


* **Fungsionalitas Filter:**
* [ ] Menu popover filter tidak boleh tertutup jika pengguna mengklik area di dalam popover tersebut. Menu baru tertutup jika pengguna mengklik "Apply now" atau mengklik area di luar popover (*outside click*).
* [ ] Input *Date picker* harus memvalidasi agar tanggal "From" tidak lebih besar dari tanggal "To".
* [ ] Mengklik "Apply now" akan me-*-refresh* data tabel sesuai parameter yang dipilih tanpa me-*-reload* seluruh halaman (*AJAX/Asynchronous*).


* **Aksi Baris:**
* [ ] Mengklik tombol "Delete" harus memunculkan modal konfirmasi ("Apakah Anda yakin ingin menghapus data ini?") sebelum aksi dijalankan agar menghindari penghapusan tidak sengaja.