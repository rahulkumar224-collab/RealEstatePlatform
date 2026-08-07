<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class PublicRouteThrottleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_login_throttles_after_five_account_attempts(): void
    {
        $user = User::factory()->create(['email' => 'buyer@example.com']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->fromIp('192.0.2.10')->postJson('/api/login', [
                'email' => strtoupper($user->email),
                'password' => 'incorrect-password',
            ])->assertUnauthorized();
        }

        $this->fromIp('192.0.2.10')->postJson('/api/login', [
            'email' => "  {$user->email}  ",
            'password' => 'incorrect-password',
        ])->assertTooManyRequests();
    }

    public function test_register_throttles_after_three_ip_attempts(): void
    {
        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->fromIp('192.0.2.20')->postJson('/api/register', [
                'name' => 'Rate Limited Buyer',
                'email' => "buyer{$attempt}@example.com",
            ])->assertUnprocessable();
        }

        $this->fromIp('192.0.2.20')->postJson('/api/register', [
            'name' => 'Rate Limited Buyer',
            'email' => 'another@example.com',
        ])->assertTooManyRequests();
    }

    public function test_inquiry_submission_throttles_repeated_property_contact(): void
    {
        $property = $this->createProperty();
        $payload = ['email' => 'contact@example.com'];

        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->fromIp('192.0.2.30')
                ->postJson("/api/properties/{$property->id}/inquiries", $payload)
                ->assertUnprocessable();
        }

        $this->fromIp('192.0.2.30')
            ->postJson("/api/properties/{$property->id}/inquiries", $payload)
            ->assertTooManyRequests();
    }

    public function test_visit_submission_throttles_repeated_property_contact(): void
    {
        $property = $this->createProperty();
        $payload = ['email' => 'visitor@example.com'];

        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->fromIp('192.0.2.40')
                ->postJson("/api/properties/{$property->id}/visits", $payload)
                ->assertUnprocessable();
        }

        $this->fromIp('192.0.2.40')
            ->postJson("/api/properties/{$property->id}/visits", $payload)
            ->assertTooManyRequests();
    }

    public function test_different_ip_does_not_share_login_bucket(): void
    {
        $user = User::factory()->create(['email' => 'separate@example.com']);
        $payload = [
            'email' => $user->email,
            'password' => 'incorrect-password',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->fromIp('192.0.2.50')->postJson('/api/login', $payload);
        }

        $this->fromIp('192.0.2.50')->postJson('/api/login', $payload)
            ->assertTooManyRequests();
        $this->fromIp('192.0.2.51')->postJson('/api/login', $payload)
            ->assertUnauthorized();
    }

    public function test_public_property_get_routes_are_not_throttled(): void
    {
        for ($attempt = 0; $attempt < 25; $attempt++) {
            $this->fromIp('192.0.2.60')->getJson('/api/properties')->assertOk();
        }
    }

    public function test_only_the_four_public_mutation_routes_use_the_named_limiters(): void
    {
        $expected = [
            'api/login' => 'throttle:login',
            'api/register' => 'throttle:register',
            'api/properties/{property}/inquiries' => 'throttle:inquiry-submission',
            'api/properties/{property}/visits' => 'throttle:visit-submission',
        ];
        $namedMiddleware = array_values($expected);

        foreach (Route::getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'api/')) {
                continue;
            }

            $assignedNamedMiddleware = array_values(array_intersect(
                $route->gatherMiddleware(),
                $namedMiddleware
            ));

            if (isset($expected[$route->uri()]) && in_array('POST', $route->methods(), true)) {
                $this->assertSame([$expected[$route->uri()]], $assignedNamedMiddleware);
            } else {
                $this->assertSame([], $assignedNamedMiddleware, $route->uri());
            }
        }
    }

    private function fromIp(string $ip): static
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip]);
    }

    private function createProperty(): Property
    {
        return Property::create([
            'title' => 'Rate Limit Test Property',
            'description' => 'Property used for public throttle tests.',
            'price' => 1000000,
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'type' => 'buy',
            'category' => 'residential',
            'area' => 1000,
        ]);
    }
}
