<?php

namespace Tests\Feature;

use Fruitcake\Cors\CorsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Middleware\HandleCors;
use Tests\TestCase;

class CorsConfigurationTest extends TestCase
{
    use RefreshDatabase;

    private const ALLOWED_ORIGIN = 'https://frontend.example.test';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('cors.allowed_origins', [
            self::ALLOWED_ORIGIN,
            'https://alternate.example.test',
        ]);
        $this->app->forgetInstance(CorsService::class);
        $this->app->forgetInstance(HandleCors::class);
    }

    public function test_configured_origin_receives_allow_origin_without_credentials(): void
    {
        $response = $this->withHeader('Origin', self::ALLOWED_ORIGIN)
            ->getJson('/api/properties');

        $response->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', self::ALLOWED_ORIGIN)
            ->assertHeaderMissing('Access-Control-Allow-Credentials');
    }

    public function test_allowed_origin_preflight_accepts_authorization_and_content_type(): void
    {
        $response = $this->call('OPTIONS', '/api/login', [], [], [], [
            'HTTP_ORIGIN' => self::ALLOWED_ORIGIN,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization, Content-Type',
        ]);

        $response->assertSuccessful()
            ->assertHeader('Access-Control-Allow-Origin', self::ALLOWED_ORIGIN)
            ->assertHeader('Access-Control-Allow-Methods');

        $allowedHeaders = strtolower((string) $response->headers->get(
            'Access-Control-Allow-Headers'
        ));

        $this->assertStringContainsString('authorization', $allowedHeaders);
        $this->assertStringContainsString('content-type', $allowedHeaders);
        $this->assertNotSame('true', strtolower((string) $response->headers->get(
            'Access-Control-Allow-Credentials'
        )));
    }

    public function test_disallowed_origin_does_not_receive_allow_origin(): void
    {
        $this->withHeader('Origin', 'https://disallowed.example.test')
            ->getJson('/api/properties')
            ->assertOk()
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
