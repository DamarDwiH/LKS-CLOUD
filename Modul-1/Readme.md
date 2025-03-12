Kita bakal Menggunakan Freamwork [Next.js](https://nextjs.org/) project dan bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Mari Kita mulai membuat Aplikasi dari Front endnya
## Pelajari ini juga sangat penting

English Chat App System uses a number of technology stack to work properly:
- [Node.js](https://nodejs.org/) - Runtime for the lambda function
- [NextJS](https://nextjs.org/) - Progressive, incrementally-adoptable JavaScript framework
- [API Gateway](https://aws.amazon.com/api-gateway/) - Fully managed service for creating, publishing, maintaining, monitoring, and securing APIs at any scale.
- [Amazon Cognito](https://aws.amazon.com/pm/cognito/) - User authentication, authorization, and user management service for web and mobile apps
- [PostgresQL](https://www.postgresql.org) - Powerful, open-source, relational database.

<hr>
Pertama kita membuat Aplikasi dari Front endnya menggunkan command menggunakan ***`AMPLIFY`***

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
# Configure Back-end
Pertama Kita bakal membuat ***`VPC (Virtual Private Cloud)`***

## Dengan VPC Cidr Zone A dan Zone B 
```bash
172.32.0.0/23 >> Untuk Zone A
10.10.0.0/23 >> Untuk Zone B
```
## Dengan IP
```bash
172.32.0.0/24 >> untuk Public Subnet
172.32.1.0/25 >> Untuk Private Subnet 1
172.32.1.128/25 >> Untuk Private subnet 2
------------------------------------------
10.10.0.0/24 >> untuk Public Subnet
10.10.1.0/25 >> Untuk Private Subnet 1
10.10.1.128/25 >> Untuk Private subnet 2
```
