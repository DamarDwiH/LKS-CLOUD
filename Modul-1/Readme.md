# Proyek Distributed LLM untuk Pembelajaran Bahasa Inggris

Proyek ini bertujuan untuk mengimplementasikan asisten AI berbasis SaaS (Software as a Service) untuk pembelajaran bahasa Inggris, termasuk infrastruktur yang diperlukan untuk model bahasa besar (LLM) multi-region. Tujuannya adalah menciptakan lingkungan pembelajaran yang stabil, aman, skalabel, dan hemat biaya.

## Daftar Isi
- [Gambaran Umum Proyek](#gambaran-umum-proyek)
- [Arsitektur](#arsitektur)
- [Detail Teknis](#detail-teknis)
- [Detail Layanan](#detail-layanan)
  - [Aplikasi Klien](#aplikasi-klien)
  - [Arsitektur Jaringan](#arsitektur-jaringan)
  - [Penyimpanan](#penyimpanan)
  - [Keamanan](#keamanan)
  - [LLM (Large Language Model)](#llm-large-language-model)
  - [Basis Data Relasional](#basis-data-relasional)
  - [Fungsi Lambda](#fungsi-lambda)
  - [API Gateway](#api-gateway)
- [Instruksi Setup](#instruksi-setup)
- [Pengujian](#pengujian)
- [Pemantauan](#pemantauan)
- [Pembersihan](#pembersihan)

---

## Gambaran Umum Proyek
Tujuan proyek ini adalah mengimplementasikan asisten AI berbasis SaaS untuk pembelajaran bahasa Inggris, termasuk infrastruktur yang diperlukan untuk model bahasa besar (LLM) multi-region. Peran Anda adalah menyiapkan infrastruktur yang mendukung asisten AI yang andal, aman, dan hemat biaya.

---

## Arsitektur
Arsitektur proyek ini melibatkan deployment komponen frontend (aplikasi klien) dan backend. Frontend akan di-deploy menggunakan **AWS Amplify**, sedangkan backend mencakup **LLM Workers**, **Scoring Workers**, dan **Chat Workers** yang di-deploy di region **N. Virginia (us-east-1)** dan **Oregon (us-west-2)**.

---

## Detail Teknis
- **Region yang Didukung**: us-east-1 (N. Virginia) dan us-west-2 (Oregon).
- **IAM Role**: Gunakan **LabRole** untuk semua kebutuhan IAM Role.
- **Kode Sumber**: Tersedia di repositori GitHub: [https://github.com/betuah/lks-llm](https://github.com/betuah/lks-llm).
- **Sistem Operasi**: Ubuntu, versi minimal 20.04.
- **Konvensi Penamaan**: Semua layanan harus menggunakan format penamaan dengan awalan `lks-`, contoh: `lks-vpc-zone-a`, `lks-api-gateway`, dll.
- **Bahasa Pemrograman**: JavaScript (Node.js versi 18 atau lebih baru).

---

## Detail Layanan

### Aplikasi Klien
Aplikasi klien menggunakan **Next.js versi 14** dan terhubung ke **AWS Cognito** untuk autentikasi. Berikut konfigurasi yang diperlukan untuk Cognito User Pool:
- Gunakan email sebagai atribut untuk sign-in.
- Jangan gunakan kata sandi sementara dalam kebijakan kata sandi.
- Implementasikan faktor autentikasi tunggal.
- Atribut wajib saat pendaftaran: nama dan email.
- Izinkan aplikasi menggunakan refresh token dan kata sandi pengguna untuk autentikasi.

**Catatan**: Jika pengguna sudah mendaftar, Anda mungkin perlu mengonfirmasi pendaftaran mereka secara manual di Cognito.

### Arsitektur Jaringan
Anda diharuskan membuat jaringan multi-region dengan dua zona:
- **lks-zone-a** (172.32.0.0/23) di region **us-east-1**.
- **lks-zone-b** (10.10.0.0/23) di region **us-west-2**.

Setiap zona harus memiliki:
- 3 subnet: 1 subnet publik dan 2 subnet privat.
- Subnet publik harus berada di Availability Zone 1a, sedangkan subnet privat di Availability Zones 1a dan 1b.
- Gunakan dua tabel rute: satu untuk subnet publik (`lks-rtb-public`) dan satu untuk subnet privat (`lks-rtb-private`).

### Penyimpanan
Gunakan **Elastic File System (EFS)** sebagai penyimpanan bersama untuk model LLM. EFS harus di-deploy di region **us-east-1** dengan konfigurasi berikut:
- Aktifkan **bursting** untuk pengaturan performa.
- Aktifkan pencadangan otomatis.
- Mount EFS ke setiap LLM Worker di lokasi `/share`.

### Keamanan
Keamanan adalah bagian penting dari proyek ini. Pastikan:
- Basis data hanya dapat diakses oleh fungsi Lambda (`lks-sg-db`).
- Instans LLM Workers hanya dapat diakses melalui port 11434 dari Load Balancer (`lks-sg-llm`).
- Load Balancer hanya dapat diakses melalui port 80 (`lks-sg-lb`).
- NAT Instance hanya dapat melakukan penerusan lalu lintas (`lks-sg-nat`).
- EFS hanya dapat diakses dari subnet privat atau grup keamanan LLM di setiap zona VPC (`lks-sg-efs`).

### LLM (Large Language Model)
Ada tiga jenis worker yang akan di-deploy:
- **LLM Workers**: Bertanggung jawab untuk embedding, menarik model, dan tugas LLM lainnya.
- **Scoring Workers**: Menghasilkan umpan balik skor untuk percakapan.
- **Chat Workers**: Menangani percakapan chat secara streaming.

Setiap worker di-deploy di subnet privat setiap zona VPC menggunakan instans tipe **t2.large**. Gunakan playbook Ansible yang disediakan di repositori untuk konfigurasi.

### Basis Data Relasional
Gunakan **PostgreSQL** dengan plugin `pqvector` untuk menyimpan riwayat percakapan dan versi vektornya. Vektor ini akan digunakan untuk evaluasi umpan balik percakapan secara real-time.

### Fungsi Lambda
Fungsi Lambda diperlukan untuk menangani permintaan dari API Gateway terkait endpoint `/conversations`. Fungsi ini akan melakukan operasi CRUD (Create, Read, Update, Delete) pada data percakapan yang disimpan di basis data.

### API Gateway
Buat **API Gateway** publik yang dapat diakses oleh aplikasi klien dari region mana pun. Hanya pengguna yang terdaftar di Cognito yang dapat mengakses endpoint API Gateway. Berikut detail endpoint yang diperlukan:

| Endpoint                  | Method | Parameter Path | Payload (Format JSON) |
|---------------------------|--------|----------------|-----------------------|
| `/conversations/(uid)`     | GET    | uid            | Tidak ada             |
| `/conversations/(uid)/(id)`| GET    | uid, id        | Tidak ada             |
| `/conversations/(uid)`     | POST   | uid            | id (wajib), title (wajib), conversation (wajib), embedding (opsional) |
| `/conversations/(uid)/(id)`| PUT    | uid, id        | title (opsional), conversation (opsional), embedding (opsional) |
| `/conversations/(uid)`     | DELETE | uid            | Tidak ada             |
| `/conversations/(uid)/(id)`| DELETE | uid, id        | Tidak ada             |

---

## Instruksi Setup
1. **Baca Dokumentasi**: Baca seluruh dokumentasi dengan teliti.
2. **AWS Console**: Masuk ke konsol AWS.
3. **Konfigurasi VPC**: Siapkan konfigurasi VPC sesuai detail di bagian Arsitektur Jaringan.
4. **Penyimpanan**: Siapkan penyimpanan dengan EFS.
5. **Grup Keamanan**: Siapkan grup keamanan.
6. **LLM dan Load Balancer**: Siapkan LLM dan Load Balancer Worker.
7. **Basis Data Relasional**: Siapkan basis data relasional.
8. **API Gateway dan Lambda**: Siapkan API Gateway dan Lambda untuk backend.
9. **Aplikasi Klien**: Siapkan aplikasi klien.
10. **Pengujian**: Lakukan pengujian menyeluruh pada seluruh infrastruktur.
11. **Pemantauan**: Konfigurasi pemantauan aplikasi dan metrik di CloudWatch.

---

## Pengujian
Lakukan pengujian menyeluruh untuk memastikan seluruh infrastruktur berfungsi sesuai harapan.

---

## Pemantauan
Konfigurasi pemantauan aplikasi dan metrik di **CloudWatch** untuk memastikan performa dan keandalan sistem.

---

## Pembersihan
Sebelum proyek berakhir, hapus semua layanan yang tidak diperlukan untuk menghindari kebingungan dan kehilangan poin.

---

**Catatan**: Pastikan untuk mengikuti semua instruksi dengan cermat dan memeriksa kembali konfigurasi sebelum menyelesaikan proyek.
