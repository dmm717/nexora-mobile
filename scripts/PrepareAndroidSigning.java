import java.io.Console;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.security.cert.*;
import java.util.*;

// Run in a real console. Passwords never enter process arguments or logs.
class PrepareAndroidSigning {
  public static void main(String[] args) throws Exception {
    if (args.length != 4) throw new IllegalArgumentException("Expected keystore, PEM, protected properties path and public SHA-256");
    Path keystore = Path.of(args[0]).toAbsolutePath();
    Path output = Path.of(args[2]).toAbsolutePath();
    if (Files.exists(output)) throw new IllegalStateException("Signing input already exists; refusing overwrite");
    Console console = System.console();
    if (console == null) throw new IllegalStateException("An interactive console with hidden password input is required");
    char[] password = console.readPassword("Existing nexora-upload keystore password (hidden): ");
    try {
      KeyStore store = KeyStore.getInstance("PKCS12");
      try (InputStream in = Files.newInputStream(keystore)) { store.load(in, password); }
      String alias = "nexora-upload";
      if (!store.entryInstanceOf(alias, KeyStore.PrivateKeyEntry.class)) throw new IllegalStateException("nexora-upload PrivateKeyEntry is missing");
      PrivateKey privateKey = (PrivateKey)store.getKey(alias, password);
      X509Certificate cert = (X509Certificate)store.getCertificate(alias);
      cert.checkValidity();
      X509Certificate pem;
      try (InputStream in = Files.newInputStream(Path.of(args[1]))) {
        pem = (X509Certificate)CertificateFactory.getInstance("X.509").generateCertificate(in);
      }
      if (!MessageDigest.isEqual(cert.getEncoded(), pem.getEncoded())) throw new IllegalStateException("Keystore and public PEM differ");
      String sha = HexFormat.of().withUpperCase().formatHex(MessageDigest.getInstance("SHA-256").digest(cert.getEncoded()));
      if (!sha.equals(args[3].replace(":", "").toUpperCase(Locale.ROOT))) throw new IllegalStateException("Unexpected upload certificate SHA-256");
      byte[] challenge = "Nexora local upload-key verification".getBytes(StandardCharsets.UTF_8);
      Signature verifier = Signature.getInstance("SHA256withRSA");
      verifier.initSign(privateKey); verifier.update(challenge); byte[] proof = verifier.sign();
      verifier.initVerify(cert.getPublicKey()); verifier.update(challenge);
      if (!verifier.verify(proof)) throw new IllegalStateException("Private key possession verification failed");
      Properties properties = new Properties();
      properties.setProperty("storeFile", keystore.toString());
      properties.setProperty("keyAlias", alias);
      properties.setProperty("storePassword", new String(password));
      properties.setProperty("keyPassword", new String(password));
      try (OutputStream out = Files.newOutputStream(output, StandardOpenOption.CREATE_NEW)) {
        properties.store(out, "Temporary local signing input; delete after build; never commit");
      }
      properties.clear();
      System.out.println("PrivateKeyEntry and PEM verified. SHA-256: " + sha);
    } finally { Arrays.fill(password, '\0'); }
  }
}
