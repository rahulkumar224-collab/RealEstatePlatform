<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'SecretPass123!';

    public function test_command_refuses_non_interactive_execution(): void
    {
        $this->artisan('admin:create', ['--no-interaction' => true])
            ->expectsOutput('The admin:create command must be run interactively.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_command_creates_admin_with_normalized_email_and_hashed_password(): void
    {
        $this->artisan('admin:create')
            ->expectsQuestion('Name', '  Production Admin  ')
            ->expectsQuestion('Email', '  ADMIN@Example.com  ')
            ->expectsQuestion('Password', self::PASSWORD)
            ->expectsQuestion('Confirm password', self::PASSWORD)
            ->expectsOutput('Administrator created successfully for admin@example.com.')
            ->doesntExpectOutputToContain(self::PASSWORD)
            ->assertSuccessful();

        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->assertSame('Production Admin', $admin->name);
        $this->assertSame(User::ROLE_ADMIN, $admin->role);
        $this->assertNotSame(self::PASSWORD, $admin->password);
        $this->assertTrue(Hash::check(self::PASSWORD, $admin->password));
    }

    public function test_duplicate_email_is_refused_without_promoting_existing_buyer(): void
    {
        $buyer = User::factory()->create([
            'email' => 'buyer@example.com',
            'role' => User::ROLE_BUYER,
        ]);

        $this->artisan('admin:create')
            ->expectsQuestion('Name', 'Replacement Admin')
            ->expectsQuestion('Email', 'BUYER@EXAMPLE.COM')
            ->expectsQuestion('Password', self::PASSWORD)
            ->expectsQuestion('Confirm password', self::PASSWORD)
            ->expectsOutput('A user with this email already exists. No account was changed.')
            ->doesntExpectOutputToContain(self::PASSWORD)
            ->assertFailed();

        $this->assertSame(User::ROLE_BUYER, $buyer->fresh()->role);
        $this->assertSame(1, User::count());
    }

    public function test_mismatched_password_confirmation_is_refused(): void
    {
        $this->assertInvalidCommand(
            'admin@example.com',
            self::PASSWORD,
            'DifferentPass123!'
        );
    }

    public function test_password_shorter_than_eight_characters_is_refused(): void
    {
        $this->assertInvalidCommand('admin@example.com', 'short', 'short');
    }

    public function test_invalid_email_is_refused(): void
    {
        $this->assertInvalidCommand('not-an-email', self::PASSWORD, self::PASSWORD);
    }

    private function assertInvalidCommand(
        string $email,
        string $password,
        string $confirmation
    ): void {
        $this->artisan('admin:create')
            ->expectsQuestion('Name', 'Test Admin')
            ->expectsQuestion('Email', $email)
            ->expectsQuestion('Password', $password)
            ->expectsQuestion('Confirm password', $confirmation)
            ->doesntExpectOutputToContain($password)
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
