"""This is for the backend password decryption"""
import base64
import binascii

from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import os
import sys

sys.path.append('../')

from BookFace.secret import *



def decrypt_request_pwd(password):
    """Decryption method
        param: password
            password that needs to be decrypted"""
    pwd = base64.b64decode(password)
    cipher_key = FUN_CIPHER_KEY.encode('utf-8')
    cipher_iv = FUN_CIPHER_IV.encode('utf-8')
    cipher = AES.new(cipher_key, AES.MODE_CBC, cipher_iv)

    decrypt_message = cipher.decrypt(pwd)
    actual_pwd = unpad(decrypt_message, AES.block_size).decode()
    return actual_pwd
