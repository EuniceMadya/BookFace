"""This is for the backend password decryption"""
import base64
import binascii

from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import os

from base64 import b64encode
from Crypto.Util.Padding import pad


def encrypt_test_pwd(message_plain):
    message = message_plain.encode()
    key = ("EVtZqpI8Hk6cuDSj").encode()
    iv = ("TuDKCpbRcbwAOOaF").encode()
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padding = pad(message, AES.block_size)
    enc_text = cipher.encrypt(pad(message, AES.block_size))
    pwd = base64.b64encode(enc_text)
    return pwd.decode()


def decrypt_request_pwd(password):
    """Decryption method
        param: password
            password that needs to be decrypted"""
    pwd = base64.b64decode(password)
    cipher_key = os.environ['FUN_CIPHER_KEY'].encode('utf-8')
    cipher_iv = os.environ['FUN_CIPHER_IV'].encode('utf-8')
    cipher = AES.new(cipher_key, AES.MODE_CBC, cipher_iv)

    decrypt_message = cipher.decrypt(pwd)
    actual_pwd = unpad(decrypt_message, AES.block_size).decode()
    return actual_pwd
