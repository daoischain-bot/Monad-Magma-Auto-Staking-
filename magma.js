require('dotenv').config();

const ethers = require('ethers');

// Konfigurasi
const RPC_URL = 'https://testnet-rpc.monad.xyz';
const CONTRACT_ADDRESS = '0x2c9C959516e9AAEdB2C748224a41249202ca8BE7';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GAS_LIMIT_UNSTAKE = 800000;
const UNSTAKE_FUNCTION_SELECTOR = '0x6fed1ea7';
const STAKE_DATA = '0xd5575982';
const MIN_WAIT_HOURS = 5;
const MAX_WAIT_HOURS = 12;
const WAIT_TIME = 60 * 1000; //60 Detik

if (!PRIVATE_KEY) {
    console.error('\x1b[31m%s\x1b[0m', "Error: PRIVATE_KEY tidak ditemukan di file .env");
    process.exit(1);
}

if (typeof PRIVATE_KEY !== 'string' || !PRIVATE_KEY.startsWith('0x') || PRIVATE_KEY.length !== 66) {
    console.error('\x1b[31m%s\x1b[0m', "Error: PRIVATE_KEY tidak valid.  Pastikan berupa string heksadesimal 66 karakter (termasuk '0x').");
    process.exit(1);
}

// Inisialisasi Provider dan Wallet
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

let nonce = null;
let nonceLock = false;
let lastStakeAmount = ethers.BigNumber.from(0);
let countdownInterval;

async function getNextNonce() {
    if (nonceLock) {
        process.stdout.write('\x1b[0G\x1b[33mMenunggu nonce lock...\x1b[0m');
        return new Promise((resolve) => {
            const interval = setInterval(async () => {
                if (!nonceLock) {
                    clearInterval(interval);
                    const nextNonce = await _getNextNonce();
                    resolve(nextNonce);
                }
            }, 100);
        });
    } else {
        return _getNextNonce();
    }
}

async function _getNextNonce() {
    nonceLock = true;
    try {
        if (nonce === null) {
            nonce = await provider.getTransactionCount(wallet.address, "pending");
        } else {
            nonce++;
        }
        return nonce;
    } catch (error) {
        console.error('\x1b[31mError mendapatkan nonce: %s\x1b[0m', error);
        throw error;
    } finally {
        nonceLock = false;
    }
}

function getRandomStakeAmount() {
    const min = 0.01;
    const max = 0.05;
    const randomAmount = Math.random() * (max - min) + min;
    return ethers.utils.parseEther(randomAmount.toFixed(18));
}

function padAmount(amount) {
    const hexAmount = amount.toHexString().slice(2);
    const paddingLength = 64 - hexAmount.length;
    const padding = '0'.repeat(paddingLength);
    return padding + hexAmount;
}

async function stake() {
    try {
        const stakeAmount = getRandomStakeAmount();
        const currentNonce = await getNextNonce();
        const gasPrice = await provider.getGasPrice();

        const tx = {
            to: CONTRACT_ADDRESS,
            data: STAKE_DATA,
            gasLimit: 800000,
            value: stakeAmount,
            nonce: currentNonce,
            gasPrice: gasPrice,
        };

        const transaction = await wallet.sendTransaction(tx);

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log('\x1b[94m%s\x1b[0m', `Staking transaction submitted: ${transaction.hash}`);

        await transaction.wait();

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log('\x1b[94m%s\x1b[0m', `Staking successful! Amount: ${ethers.utils.formatEther(stakeAmount)}`);

        lastStakeAmount = stakeAmount;
        return true;
    } catch (error) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.error('\x1b[31mError staking: %s\x1b[0m', error);
        return false;
    }
}

async function unstake() {
    try {
        const currentNonce = await getNextNonce();
        const gasPrice = await provider.getGasPrice();

        const paddedAmount = padAmount(lastStakeAmount);
        const data = UNSTAKE_FUNCTION_SELECTOR + paddedAmount;

        const tx = {
            to: CONTRACT_ADDRESS,
            data: data,
            gasLimit: GAS_LIMIT_UNSTAKE,
            nonce: currentNonce,
            gasPrice: gasPrice
        };

        const transaction = await wallet.sendTransaction(tx);

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log('\x1b[33m%s\x1b[0m', `Unstaking transaction submitted: ${transaction.hash}`);

        await transaction.wait();

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log('\x1b[33m%s\x1b[0m', "Unstaking successful!");

         process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log('\x1b[33m%s\x1b[0m', "Unstake berhasil.");
        return true;

    } catch (error) {
         process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.error('\x1b[31mError unstaking: %s\x1b[0m', error);
        return false;
    }
}

async function runBot() {
    try {
         process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log('\x1b[34m%s\x1b[0m', "Memulai Proses Stake...");

        const stakeSuccess = await stake();

        if (stakeSuccess) {
            let timeLeft = WAIT_TIME;

            //fungsi countdown untuk wait time
            function displayCountdown() {
                if (timeLeft > 0) {
                    const seconds = Math.floor(timeLeft / 1000);
                    process.stdout.clearLine(0);  // Clear current line
                    process.stdout.cursorTo(0);   // Move cursor to beginning of line
                    process.stdout.write('\x1b[35mMenunggu ' + seconds + ' detik untuk unstake...\x1b[0m');
                    timeLeft -= 1000;
                    setTimeout(displayCountdown, 1000); // Perbarui setiap detik
                } else {
                    process.stdout.clearLine(0);  // Clear current line
                    process.stdout.cursorTo(0);   // Move cursor to beginning of line
                    console.log('\x1b[34m%s\x1b[0m', "Memulai Proses Unstake...");
                    unstake();

                    const waitHours = Math.random() * (MAX_WAIT_HOURS - MIN_WAIT_HOURS) + MIN_WAIT_HOURS;
                    const waitTime = waitHours * 60 * 60 * 1000;

                    // Hitung waktu berakhir
                    const endTime = Date.now() + waitTime;

                    // Fungsi untuk menampilkan hitung mundur
                    function displayCycleCountdown() {
                        const timeLeft = endTime - Date.now();

                        if (timeLeft > 0) {
                            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                             process.stdout.clearLine(0);  // Clear current line
                             process.stdout.cursorTo(0);   // Move cursor to beginning of line
                            process.stdout.write('\x1b[36mMenunggu ' + seconds + ' detik:' + minutes + ' menit:' + hours + ' jam sebelum siklus berikutnya...\x1b[0m');
                        } else {
                            process.stdout.clearLine(0);  // Clear current line
                             process.stdout.cursorTo(0);   // Move cursor to beginning of line
                            console.log('\x1b[36mWaktu habis! Memulai siklus berikutnya...\x1b[0m');
                            clearInterval(countdownInterval); // Hentikan interval
                            runBot();
                        }
                    }

                    countdownInterval = setInterval(displayCycleCountdown, 1000);
                }
            }

            displayCountdown();

        } else {
             process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
            console.error('\x1b[31mStake gagal.\x1b[0m');
            const waitHours = Math.random() * (MAX_WAIT_HOURS - MIN_WAIT_HOURS) + MIN_WAIT_HOURS;
            const waitTime = waitHours * 60 * 60 * 1000;
            setTimeout(runBot, waitTime);
        }

    } catch (error) {
         process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.error('\x1b[31mError dalam logika bot utama: %s\x1b[0m', error);
         const waitHours = Math.random() * (MAX_WAIT_HOURS - MIN_WAIT_HOURS) + MIN_WAIT_HOURS;
            const waitTime = waitHours * 60 * 60 * 1000;
            setTimeout(runBot, waitTime);
    }
}

// Mulai bot
runBot();
