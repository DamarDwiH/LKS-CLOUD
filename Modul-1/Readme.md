Kita bakal Meenggunakan Freamework [Next.js](https://nextjs.org/) project dan bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Mari Kita mulai membuat Aplikasi dari Front endnya menggunkan code ini

Pertama membuat Aplikasi dari Front endnya menggunkan code ini

```bash
npm run dev
# or
yarn dev
```

Buka ***`http://YOUR_DOMAIN_OR_IP`*** dengan browser Anda untuk melihat hasilnya. Anda dapat mengarahkan ke ***`http://YOUR_DOMAIN_OR_IP/check`*** untuk memeriksa semua API Endpoint, Anda masih perlu masuk untuk mendapatkan token dari cognito guna memverifikasi setiap endpoint dengan Otorisasi.

## Membuat Varibel .env
These environment variables must be executed during the build phase, and make sure all environments are set before building or compiling the application. The application should only read environments from the .env file, but never upload the .env file to the Git repository or you will lose the point.

```sh
AUTH_SECRET="GENERATE_RANDOM_STRING_SECRET"
NEXT_PUBLIC_COGNITO_CLIENT_ID=YOUR_COGNITO_APPS_CLIENT_ID
NEXT_PUBLUC_COGNITO_ID_TOKEN_EXPIRED=YOUR_COGNITO_ID_TOKEN_EXPIRED_IN_MINUTES
NEXT_PUBLIC_API_GATEWAY_URL=YOUR_API_GATEWAY_URL
```

To generate random string for auth secret you can use this command:
```sh
openssl rand -base64 16
```
