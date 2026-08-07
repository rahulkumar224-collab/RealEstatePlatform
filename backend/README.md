# RealEstatePlatform backend

Laravel API backend for RealEstatePlatform. It provides public property browsing and contact endpoints, Sanctum bearer-token authentication, buyer registration, and administrator-only property and inquiry management.

Users have either the `buyer` or `admin` role. Public registration always creates buyers. Administrators must be provisioned through the secure interactive command documented below.

## Local setup

Requirements include PHP 8.2 or newer, Composer, the PHP extensions required by Laravel, and a supported database.

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configure the database connection in `.env`, then initialize the application:

```bash
php artisan migrate
php artisan storage:link
php artisan serve
```

Do not commit `.env` or credentials.

## Production environment

Configure production values outside source control. Important settings include:

- `APP_NAME`: application display name.
- `APP_ENV=production`.
- `APP_KEY`: generated once and then preserved.
- `APP_DEBUG=false`.
- `APP_URL`: externally reachable HTTPS backend origin, without `/api`.
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` as required by the selected database.
- `CORS_ALLOWED_ORIGINS`: comma-separated exact frontend origins without trailing slashes.
- `SANCTUM_EXPIRATION`: bearer-token lifetime in minutes; the default is `10080` (seven days).
- `CACHE_STORE`: must be persistent and writable for rate limiting. A database cache is acceptable for a small single server; Redis is an option when available.
- `SESSION_DRIVER`: configure for the deployment even though API authentication currently uses bearer tokens.
- `FILESYSTEM_DISK`: consider persistence and backups. Current upload controllers use the local `public` disk explicitly.

Never place secrets in frontend `NEXT_PUBLIC_*` variables.

## First production deployment

If replacing existing data, take and verify backups before deployment.

```bash
composer install --no-dev --optimize-autoloader
# Create and configure the production .env outside source control.
php artisan migrate --force
php artisan storage:link
php artisan optimize
php artisan admin:create
```

`admin:create` is interactive. It prompts for name, email, password, and password confirmation. Password input is hidden, no default password exists, and the command refuses to replace or promote an existing user. Never commit or record administrator credentials in source-controlled files or shell scripts.

Configure the web server so its document root is `backend/public`, and supervise the PHP/web processes with the operating system's service manager.

## Subsequent deployments

Back up the database and uploaded files before applying code or schema changes. Review pending migrations first:

```bash
php artisan migrate:status
```

For deployments that require maintenance mode:

```bash
php artisan down
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
php artisan up
```

Do not run `migrate:fresh`, `migrate:reset`, or other destructive database commands in production. Do not regenerate `APP_KEY` after production data is in use.

## Scheduler

The scheduler is required for daily pruning of expired Sanctum tokens. Run Laravel's scheduler every minute from cron:

```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Confirm registered work with:

```bash
php artisan schedule:list
```

No queue worker is required by current application features. Reassess this if queued mail, notifications, or jobs are introduced.

## Upload storage

Uploads use Laravel's `public` disk and are stored under:

```text
storage/app/public
```

`php artisan storage:link` creates the required `public/storage` link. The web-server user must be able to write to `storage` and `bootstrap/cache`.

The current deployment requires a persistent local filesystem. It is not suitable for ephemeral/serverless or multi-instance hosting without moving uploads to shared or object storage. Include `storage/app/public` in backups.

## HTTPS and reverse proxies

`APP_URL` must use the externally reachable HTTPS backend origin so generated image and avatar URLs do not cause mixed-content errors.

Frontend and backend may use separate origins. When they do, list every allowed frontend origin exactly in `CORS_ALLOWED_ORIGINS` and serve both applications over HTTPS.

If TLS terminates at a reverse proxy or load balancer, configure Laravel's trusted proxies to match the real infrastructure and forward the correct scheme and client IP. Do not trust arbitrary proxies. Incorrect proxy configuration can generate HTTP asset URLs and undermine IP-based rate limiting.

## Backups and rollback

Before production changes:

- Back up the database.
- Back up `storage/app/public`.
- Test restoration procedures rather than assuming backups are usable.
- Preserve the previous application release for rollback.
- Plan database migration and code rollback together; reverting code alone may not reverse schema changes safely.

Never overwrite the only backup during deployment.

## Testing and verification

Run the automated suite and deployment checks from the backend directory:

```bash
php artisan test
./vendor/bin/pint --test
php artisan route:list --path=api
php artisan schedule:list
```

On Windows, use `vendor\\bin\\pint.bat --test` for Pint when required by the shell.

The project currently uses persistent local upload storage. The scheduler is required in production; a queue worker is not currently required.
