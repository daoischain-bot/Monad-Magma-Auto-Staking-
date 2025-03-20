# Monad Staking Bot

Bot ini secara otomatis melakukan stake dan unstake token pada jaringan Monad Testnet.

## Peringatan Penting

**Gunakan bot ini dengan risiko Anda sendiri. Saya tidak bertanggung jawab atas kehilangan dana yang disebabkan oleh penggunaan bot ini.**

*   **Kunci Privat:** Bot ini menggunakan kunci privat Anda untuk menandatangani transaksi.  **Lindungi kunci privat Anda dengan sangat hati-hati. Jangan pernah melakukan commit kunci privat Anda ke repositori publik.**
*   **Testnet Saja:** Bot ini dirancang untuk digunakan pada jaringan Monad Testnet. Jangan menggunakannya di mainnet.
*   **Audit Kontrak:** Saya belum mengaudit kontrak staking. Pastikan Anda memahami risiko yang terkait dengan berinteraksi dengan kontrak ini.
*   **Gas:** Pastikan Anda memiliki cukup gas untuk membayar transaksi Anda.
*   **Pengujian:** Uji bot ini secara menyeluruh di testnet sebelum menggunakannya dengan dana sungguhan.

## Fitur

*   Otomatisasi Stake dan Unstake
*   Membaca Kunci Privat dari File `.env`
*   Penanganan Nonce
*   Gas Price Otomatis
*   Output Berwarna (ANSI)
*   Jeda Waktu Acak Antara Siklus

## Prasyarat

*   [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
*   [npm](https://www.npmjs.com/) (Node Package Manager)
*   Akses ke node Monad Testnet RPC

## Instalasi

1.  Clone repositori ini:

    ```bash
    git clone <repository_url>
    ```

2.  Buka direktori proyek:

    ```bash
    cd monad-staking-bot
    ```

3.  Instal dependensi:

    ```bash
    npm install
    ```

4.  Buat file `.env` dan atur variabel lingkungan `PRIVATE_KEY`:

    ```
    PRIVATE_KEY=0x...your_private_key...
    ```

    **Peringatan:** Jangan commit file `.env` ke repositori publik.

## Konfigurasi

Konfigurasikan bot dengan mengedit variabel di bagian atas file `bot.js`:

*   `RPC_URL`: URL node Monad Testnet RPC.
*   `CONTRACT_ADDRESS`: Alamat kontrak staking.
*   `GAS_LIMIT_UNSTAKE`: Batas gas untuk transaksi unstake.
*   `UNSTAKE_FUNCTION_SELECTOR`: Pemilih fungsi untuk fungsi unstake pada kontrak.
*   `STAKE_DATA`: Data untuk transaksi staking.
*   `MIN_WAIT_HOURS`: Jeda waktu minimum antara siklus (dalam jam).
*   `MAX_WAIT_HOURS`: Jeda waktu maksimum antara siklus (dalam jam).

## Cara Menjalankan

1.  Pastikan semua konfigurasi sudah benar.
2.  Jalankan bot:

    ```bash
    node bot.js
    ```

## Informasi Tambahan

Bot secara otomatis:

1.  Melakukan stake dengan jumlah acak antara 0,01 dan 0,05 token.
2.  Menunggu 60 detik.
3.  Melakukan unstake dengan mengirimkan semua token yang baru saja di stake.
4.  Mengulang proses menunggu waktu acak (antara 5 dan 12 jam).

## Kontribusi

Silakan berkontribusi dengan mengirimkan pull request.

## Lisensi

[MIT](LICENSE)
