# Backend configuration

Before starting the Spring Boot application, set these environment variables:

- `DB_USERNAME` and `DB_PASSWORD` for the MySQL account.
- `JWT_SECRET` to a Base64-encoded random secret containing at least 32 bytes.
- `DB_URL` is optional and defaults to `jdbc:mysql://localhost:3306/smart_apartment`.

Keep credentials and signing keys out of source control.
