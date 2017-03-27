const url = require('url');
const kbpgp = require('kbpgp');
const request = require('superagent');
const randomColor = require('randomcolor');

const urlinputbox = document.getElementById('pgpkeyurl');
const messagebox = document.getElementById('message');
const encryptbutton = document.getElementById('btnencrypt');

class Pgp2go {
    constructor() {
        document.getElementsByTagName('fieldset')[0].style.backgroundColor = randomColor({
            luminosity: 'bright',
            format: 'rgba'
        });
    }

    startEncryption() {
        encryptbutton.classList.remove('error');
        encryptbutton.classList.add('working');
        if (urlinputbox.value == "") {
            this.showError(new Error('I need a public pgp key :('));
            return;
        }
        let keyurl = url.parse(urlinputbox.value);
        if (keyurl.hostname) { // Check if its a url
            this.downloadPublicKey();
        } else {
            this.encryptText(urlinputbox.value, messagebox.value);
        }
    }

    downloadPublicKey() {
        encryptbutton.textContent = 'Downloading public key ...';
        request
            .get(urlinputbox.value)
            .end((err, key) => {
                if (err) {
                    err.message += ' Try to directly paste the public PGP key in.';
                    this.showError(err);
                    return;
                }
                this.encryptText(key.text, messagebox.value);
            });
    }

    encryptText(key, msg) {
        encryptbutton.textContent = 'Checking key ...';
        kbpgp.KeyManager.import_from_armored_pgp({
            armored: key
        }, (error, recipient) => {
            if (error) {
                this.showError(error);
                return;
            }
            encryptbutton.textContent = 'Encrypting message ...';
            kbpgp.box({
                msg: msg,
                encrypt_for: recipient
            }, (err, armored_string) => {
                if (err) {
                    this.showError(err);
                    return;
                }
                encryptbutton.textContent = 'Done :)';
                messagebox.value = armored_string;
                messagebox.focus();
                messagebox.select();
                encryptbutton.classList.remove('working');
            });
        });
    }

    showError(error) {
        encryptbutton.textContent = error.message;
        encryptbutton.classList.remove('working');
        encryptbutton.classList.add('error');
    }
}

let p2g = new Pgp2go();

encryptbutton.onclick = function () {
    p2g.startEncryption();
    return false;
};

urlinputbox.onkeyup = function () {
    let rows_current = Math.trunc((urlinputbox.value.length * parseFloat(window.getComputedStyle(urlinputbox, null).getPropertyValue('font-size'))) / (urlinputbox.offsetWidth * 1.5)) + 1;
    urlinputbox.rows = (rows_current > 10) ? 10 : rows_current;
};