<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $normalizedEmail = static fn (Request $request): string => Str::lower(
            trim((string) $request->input('email', ''))
        );

        $boundedKey = static fn (string ...$parts): string => hash(
            'sha256',
            implode('|', $parts)
        );

        $propertyRouteKey = static function (Request $request): string {
            $property = $request->route('property');

            return is_object($property) && method_exists($property, 'getRouteKey')
                ? (string) $property->getRouteKey()
                : (string) $property;
        };

        RateLimiter::for('login', function (Request $request) use ($normalizedEmail, $boundedKey) {
            $ip = $request->ip();
            $accountKey = $boundedKey($normalizedEmail($request), $ip);

            return [
                Limit::perMinute(5)->by("login-account:{$accountKey}"),
                Limit::perMinute(20)->by("login-ip:{$ip}"),
            ];
        });

        RateLimiter::for('register', function (Request $request) use ($normalizedEmail, $boundedKey) {
            $ip = $request->ip();
            $accountKey = $boundedKey($normalizedEmail($request), $ip);

            return [
                Limit::perMinute(3)->by("register-ip:{$ip}"),
                Limit::perMinutes(10, 2)->by("register-account:{$accountKey}"),
            ];
        });

        RateLimiter::for('inquiry-submission', function (Request $request) use ($normalizedEmail, $boundedKey, $propertyRouteKey) {
            $ip = $request->ip();
            $contactKey = $boundedKey(
                $propertyRouteKey($request),
                $normalizedEmail($request),
                $ip
            );

            return [
                Limit::perMinute(5)->by("inquiry-ip:{$ip}"),
                Limit::perMinutes(10, 2)->by("inquiry-property-contact:{$contactKey}"),
            ];
        });

        RateLimiter::for('visit-submission', function (Request $request) use ($normalizedEmail, $boundedKey, $propertyRouteKey) {
            $ip = $request->ip();
            $contactKey = $boundedKey(
                $propertyRouteKey($request),
                $normalizedEmail($request),
                $ip
            );

            return [
                Limit::perMinute(5)->by("visit-ip:{$ip}"),
                Limit::perMinutes(10, 2)->by("visit-property-contact:{$contactKey}"),
            ];
        });
    }
}
