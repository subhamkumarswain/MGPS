package com.mgps.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtil {
    private static final SecureRandom RNG = new SecureRandom();
    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;

    public static String generateSalt() {
        byte[] salt = new byte[16];
        RNG.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public static String hashPassword(char[] password, String saltBase64) throws Exception {
        byte[] salt = Base64.getDecoder().decode(saltBase64);
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
        SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] hash = skf.generateSecret(spec).getEncoded();
        return Base64.getEncoder().encodeToString(hash);
    }

    public static boolean verifyPassword(char[] password, String saltBase64, String expectedHash) throws Exception {
        String hash = hashPassword(password, saltBase64);
        return MessageDigest.isEqual(hash.getBytes(), expectedHash.getBytes());
    }
}
