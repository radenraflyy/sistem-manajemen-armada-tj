# Sistem Manajemen Armada

Dashboard untuk memantau kendaraan, rute, dan trip secara real-time melalui peta dan tampilan data. Aplikasi menggunakan MBTA V3 API sebagai sumber data, sehingga contoh kendaraan dan lokasi yang ditampilkan berasal dari jaringan MBTA.

## Teknologi

- **React 19** dan **TypeScript 6** untuk membangun antarmuka dan menjaga tipe data.
- **Vite 8** sebagai development server dan production bundler.
- **React Router 7** untuk routing dan pemuatan halaman secara lazy.
- **TanStack React Query 5** untuk fetching, cache, status loading/error, pagination, dan refetch berkala.
- **Axios** sebagai HTTP client untuk MBTA API.
- **MapLibre GL** untuk peta interaktif dan marker kendaraan.
- **Tailwind CSS 4** untuk styling.
- **ESLint** dan **Prettier** untuk pemeriksaan kode dan format.
- **Husky** dan **lint-staged** untuk menjalankan pemeriksaan otomatis pada Git hooks.

## Menjalankan aplikasi

Persyaratan: Node.js yang kompatibel dengan Vite 8 dan Yarn Classic.

```bash
yarn install
yarn dev
```

Buka URL development yang ditampilkan Vite, biasanya `http://localhost:5173`.

Aplikasi menggunakan `https://api-v3.mbta.com` secara default. Jika perlu mengganti alamat API, buat file `.env.local` di root project:

```env
VITE_API_BASE_URL=https://api-v3.mbta.com
```

## Halaman aplikasi

- `/vehicle` — cari dan filter armada, lalu lihat kendaraan dalam mode grid, tabel, atau peta.
- `/routes` — telusuri rute dan informasi operasionalnya.
- `/trips` — telusuri trip dan filter berdasarkan beberapa rute.

Filter, pencarian, pilihan tampilan, dan pagination disimpan pada URL agar dapat dipertahankan saat halaman dimuat ulang atau dibagikan. Pencarian menggunakan debounce 300 ms.

Posisi kendaraan dan ringkasan armada diperbarui berkala melalui polling API.

## Perintah project

```bash
yarn dev          # Jalankan development server
yarn build        # Type-check dan buat production build
yarn preview      # Preview production build secara lokal
yarn lint         # Jalankan ESLint
yarn lint:fix     # Perbaiki masalah ESLint yang bisa diperbaiki otomatis
yarn format       # Format file dengan Prettier
yarn format:check # Periksa format tanpa mengubah file
yarn quality      # Jalankan lint, pemeriksaan format, dan production build
```

Git hook Husky menjalankan `lint-staged` saat commit. Saat push, hook menjalankan `yarn quality`.

## Arsitektur source

Struktur utama mengikuti alur **components → views → pages**, dengan layout bersama dan lapisan data terpisah.

```text
src/
├── components/    # Komponen UI reusable dan komponen khusus fitur
├── views/         # Orkestrasi tampilan, state halaman, filter, dan query
├── pages/         # Wrapper tipis untuk memasangkan view dengan route
├── layouts/       # Kerangka aplikasi bersama: header, footer, dan outlet
├── services/      # Query dan olah data per domain: vehicles, routes-vehicle, trips
├── data-service/  # API client dan registry endpoint
├── hooks/         # Hook untuk URL filter dan perilaku pencarian
├── constants/     # Konstanta fitur, status, dan waktu debounce
├── lib/           # Konfigurasi library bersama, termasuk React Query client
├── types/         # Tipe data API dan domain aplikasi
└── utils/         # Fungsi pemetaan, filtering, dan helper umum
```

### Alur data

1. `pages` memilih view yang sesuai, sementara `AppLayout` menyediakan kerangka bersama.
2. `views` mengatur state layar dan memanggil hook query dari `services`.
3. `services` meminta data melalui `useQueryApiRequest` dan memetakan respons MBTA ke tipe domain aplikasi.
4. `data-service/apiClient.ts` menangani request HTTP bersama. Registry endpoint berada di `data-service/queries`.
5. TanStack React Query menyimpan cache dan mengelola loading, error, pagination, serta pembaruan berkala.
6. `components` menampilkan hasil query sebagai tabel, grid, filter, modal, atau peta.

Peta dan halaman dimuat secara lazy agar dependensi MapLibre tidak ikut membebani bundle awal.
