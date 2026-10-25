# Sistem Manajemen Armada

Dashboard armada berbasis React, TypeScript, Vite, dan MBTA V3 API. Aplikasi menyediakan halaman kendaraan, rute, trip, serta peta armada.

## Menjalankan aplikasi

Gunakan Node.js dan Yarn Classic yang kompatibel dengan Vite 8.

```bash
yarn install
yarn dev
```

API menggunakan `https://api-v3.mbta.com` secara default. Untuk mengganti base URL, buat file `.env.local`:

```env
VITE_API_BASE_URL=https://api-v3.mbta.com
```

## Pemeriksaan kode

```bash
yarn lint          # ESLint
yarn format        # Terapkan format Prettier
yarn format:check  # Periksa format tanpa mengubah file
yarn build         # TypeScript dan production build
yarn quality       # Jalankan ESLint, Prettier, dan build
```

Husky menjalankan ESLint dan Prettier pada file staged sebelum commit. Sebelum push, Husky menjalankan `yarn quality`.

## Struktur source

- `src/components`: komponen UI reusable; `vehicles` dan `service-data` menyimpan komponen per fitur.
- `src/views`: layar utama per fitur, dirangkai dari komponen reusable.
- `src/pages`: wrapper tipis yang memasangkan view dengan route aplikasi.
- `src/layouts`: kerangka bersama untuk halaman aplikasi, seperti header, footer, dan outlet route.
- `src/constants`: label status dan rute, batas halaman API, serta kebijakan cache armada.
- `src/data-service/queries`: daftar endpoint API yang dipisah menjadi domain `vehicles`, `routes`, dan `trips`.
- `src/services`: request dan query per domain, dengan parsing respons bersama di `mbtaApi.ts`.
- `src/hooks`: state filter URL sehingga pencarian, filter, dan pagination bertahan saat halaman dimuat ulang.
- `src/utils`: helper dan fungsi pemfilteran/pengelompokan data yang dapat digunakan lintas halaman.

Halaman dimuat dengan lazy loading. Komponen peta dan library MapLibre juga dipisahkan dari bundle halaman awal.
