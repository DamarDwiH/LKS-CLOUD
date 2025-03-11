Kita bakal Meenggunakan Freamework [Next.js](https://nextjs.org/) project dan bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Mari Kita mulai membuat Aplikasi dari Front endnya

Pertama membuat Aplikasi dari Front endnya menggunkan command

```bash
npm run dev
# or
yarn dev
```

Buka ***`http://YOUR_DOMAIN_OR_IP`*** dengan browser Anda untuk melihat hasilnya. Anda dapat mengarahkan ke ***`http://YOUR_DOMAIN_OR_IP/check`*** untuk memeriksa semua API Endpoint, Anda masih perlu masuk untuk mendapatkan token dari cognito guna memverifikasi setiap endpoint dengan Otorisasi.

## Membuat Varibel .env
Variabel lingkungan ini harus dijalankan selama fase pembuatan, dan pastikan semua lingkungan telah ditetapkan sebelum membangun atau mengompilasi aplikasi. Aplikasi hanya boleh membaca lingkungan dari file .env.

```sh
AUTH_SECRET="GENERATE_RANDOM_STRING_SECRET"
NEXT_PUBLIC_COGNITO_CLIENT_ID=YOUR_COGNITO_APPS_CLIENT_ID
NEXT_PUBLUC_COGNITO_ID_TOKEN_EXPIRED=YOUR_COGNITO_ID_TOKEN_EXPIRED_IN_MINUTES
NEXT_PUBLIC_API_GATEWAY_URL=YOUR_API_GATEWAY_URL
```

Cara Membuat code 16 Secara acak dengan command:
```sh
openssl rand -base64 16
```
