<div align="center">

# 🚀 RISENOLOGI JAMS
### Journal Quality Intelligence & Accreditation Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Sistem Intelijen Tata Kelola, Kesiapan Akreditasi Sinta/Arjuna, dan Otomatisasi Komunikasi Editorial 2-Arah untuk Jurnal Risenologi (KPM UNJ).</b>
</p>

[📌 Fitur Utama](#-fitur-utama) • [🏗️ Arsitektur & Tech Stack](#-arsitektur--tech-stack) • [🚀 Panduan Memulai](#-panduan-memulai) • [🌐 Integrasi Google Spreadsheet](#-integrasi-google-spreadsheet) • [🔒 Matriks Peran & Hak Akses](#-matriks-peran--hak-akses) • [🚀 Deploy ke Vercel](#-deploy-ke-vercel)

---

</div>

## 📖 Tentang Projek

**Risenologi JAMS (Journal Accreditation & Management System)** adalah platform intelijen tata kelola jurnal ilmiah tingkat enterprise yang dirancang khusus untuk memandu tim editorial **Jurnal Risenologi (KPM UNJ)** mencapai standar akreditasi Sinta/Arjuna tertinggi.

Platform ini menggabungkan estimasi skor akreditasi real-time, audit kesiapan naskah, manajemen mitra bestari (reviewer), simulasi kelulusan Sinta, serta **Internal Communication System** yang terintegrasi 2-arah dengan Google Spreadsheet dan Gmail SMTP resmi (`risenologikpm@unj.ac.id`).

---

## 📌 Fitur Utama

### 📊 1. Fondasi & Mutu Tata Kelola
- **Dashboard Mutu**: Visualisasi real-time skor kesiapan akreditasi, statistik terbitan, dan indikator mutu Arjuna.
- **Desk Evaluation**: Evaluasi mandiri otomatis berdasarkan 8 kriteria akreditasi Arjuna Sinta.
- **Tata Kelola Jurnal**: Manajemen profil jurnal, legalitas e-ISSN, integrasi Crossref DOI, dan kebijakan editorial.
- **Referensi Rubrik**: Panduan rinci indikator penilaian, bobot skor, dan pedoman akreditasi resmi Kemdiktisaintek.

### 📄 2. Manajemen Naskah & Reviewer
- **Kesiapan Naskah**: Tracking kesiapan akreditasi per naskah, validasi kontak (Email & WhatsApp), dan integrasi pemicu komunikasi.
- **Registry Reviewer**: Database mitra bestari (reviewer), kualifikasi keilmuan, serta rekam jejak durasi penugasan review.

### 🧠 3. Intelijen & Perencanaan
- **Intelijen Akreditasi**: Deteksi risiko editorial berbasis aturan cerdas dan estimasi peluang kelulusan Sinta.
- **Simulator Akreditasi**: Simulator interaktif untuk menguji dampak peningkatan indikator terhadap kenaikan peringkat Sinta.
- **Timeline Editorial**: Linimasa editorial 9-Fase yang terhubung secara otomatis dengan Google Spreadsheet Workflow.

### ✉️ 4. Internal Communication System & Otomatisasi
- **Master Template Komunikasi**: Manajemen template korespondensi editorial dengan variabel dinamis (`{{author_name}}`, `{{article_title}}`, dsb.).
- **Searchable Contact Selector**: Fitur pencarian kata kunci instan untuk memilih penerima pesan (Section Editor, Journal Manager, Author, Reviewer) dilengkapi dengan *role badges*.
- **Pesan Email SMTP Resmi**: Pengiriman email fisik otomatis via Nodemailer Gmail SMTP dari alamat resmi `risenologikpm@unj.ac.id`.
- **Audit Trail & Logging**: Pencatatan riwayat transaksi komunikasi terpusat pada tabel `communication_action` dan `audit_logs`.

---

## 🏗️ Arsitektur & Tech Stack

| Komponen | Teknologi yang Digunakan |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) & React 19 |
| **Bahasa Pemrograman** | [TypeScript (Strict Mode)](https://www.typescriptlang.org/) |
| **Styling & UI** | [TailwindCSS v4](https://tailwindcss.com/), Lucide Icons, Glassmorphism UI |
| **Database & Authentication** | [Supabase Postgres](https://supabase.com/) & Supabase Auth (Row Level Security Enabled) |
| **Email Dispatch Engine** | [Nodemailer](https://nodemailer.com/) dengan Gmail SMTP (`risenologikpm@unj.ac.id`) |
| **Otomasisasi Spreadsheet** | Google Apps Script (Web App Endpoint, 2-Way Sync API) |
| **Deployment & Hosting** | [Vercel Cloud Platform](https://vercel.com/) |

---

## 🌐 Integrasi Google Spreadsheet

Risenologi JAMS terhubung secara **2-Arah (Two-Way Live Sync)** dengan [Google Spreadsheet Editorial Workflow](https://docs.google.com/spreadsheets/d/1_r44jmvzyKOb8fTvnwJ79OHm1esXUb5OaIzStqEtr1I/edit?usp=sharing).

### Fitur Integrasi:
1. **Pemicu Sinkronisasi 1-Klik**: Tombol *Sync Ke Spreadsheet* pada halaman [Timeline Editorial](/app/timeline) untuk memperbarui data naskah dan linimasa.
2. **Endpoint API Webhook**: Route `/api/spreadsheet/sync` yang dapat dipanggil oleh Google Apps Script.
3. **Cron Pengingat Otomatis Harian**: Skrip Google Apps Script yang menjalankan pengiriman email pengingat harian dari `risenologikpm@unj.ac.id` setiap pukul 08:00 WIB.

---

## 🔒 Matriks Peran & Hak Akses

Aplikasi memiliki 21 akun resmi yang dikelompokkan dalam matriks peran (*Row Level Security*):

| Peran (*Role*) | Deskripsi | Akses Modul |
|---|---|---|
| `administrator` | **Super Administrator** | Akses penuh ke seluruh modul, pengaturan jurnal, dan manajemen template. |
| `journal_manager` | **Journal Manager** | Kelola tata kelola, pemicu komunikasi internal ke Editor/Reviewer, dan simulasi skor. |
| `editor` | **Section Editor** | Kelola kesiapan naskah, komunikasi ke Author/Reviewer, dan evaluasi substantif. |

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- **Node.js**: `v18.17.0` atau yang lebih baru
- **npm**: `v9.0.0` atau yang lebih baru

### 2. Kloning Repositori
```bash
git clone https://github.com/farrelfz/Risenologi-JAMS.git
cd Risenologi-JAMS
```

### 3. Konfigurasi Variabel Lingkungan (`.env`)
Buat berkas `.env` pada direktori utama projek dan isi dengan konfigurasi berikut:

```env
# SUPABASE CONFIGURATION
SUPABASE_URL=https://xckdnwlqdvxeknsgiaoz.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key

NEXT_PUBLIC_SUPABASE_URL=https://xckdnwlqdvxeknsgiaoz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SYvc5qEon8jaPkZ7a9MiFw_Li1d0V1L

# GOOGLE SHEETS WEBHOOK ENDPOINT
NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbyi8ldXZ4QKecpwwSzFc3F8aEL7xpQdtoihS-pNgoMF_pOSkA-PSIOQYI10y_5JtKJUDw/exec

# OFFICIAL RISENOLOGI SMTP CONFIGURATION (GMAIL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=risenologikpm@unj.ac.id
SMTP_PASS=your_gmail_app_password
SMTP_FROM_NAME="JAMS Risenologi Editorial Team"
SMTP_FROM_EMAIL=risenologikpm@unj.ac.id
```

### 4. Instalasi Dependensi
```bash
npm install
```

### 5. Jalankan Server Pengembang
```bash
npm run dev
```
Buka peramban dan akses **[http://localhost:3000](http://localhost:3000)**.

---

## 🚀 Deploy ke Vercel

1. Buka Dasbor [Vercel](https://vercel.com/) &rarr; Klik **Add New Project**.
2. Impor repositori GitHub: `farrelfz/Risenologi-JAMS`.
3. Masukkan seluruh variabel lingkungan dari berkas `.env` ke bagian **Environment Variables** di Vercel.
4. Klik **Deploy**.

---

## 📄 Lisensi & Hak Cipta

Pengembangan sistem ini dilindungi hak cipta dan dikhususkan untuk operasional tata kelola terbitan ilmiah institusional.

© 2026 **Muhamad Farrel Dava Fauzan** — **Jurnal Risenologi (KPM UNJ)**. All Rights Reserved.
