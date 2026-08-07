<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SanctumExpirationTest extends TestCase
{
    use RefreshDatabase;

    public function test_fresh_bearer_token_authenticates(): void
    {
        config()->set('sanctum.expiration', 60);
        $user = User::factory()->create();
        $token = $user->createToken('expiration-test');

        $this->withToken($token->plainTextToken)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_token_older_than_configured_expiration_is_rejected(): void
    {
        config()->set('sanctum.expiration', 60);
        $user = User::factory()->create();
        $token = $user->createToken('expiration-test');

        $token->accessToken->forceFill([
            'created_at' => now()->subMinutes(61),
        ])->save();

        $this->withToken($token->plainTextToken)
            ->getJson('/api/user')
            ->assertUnauthorized();
    }
}
