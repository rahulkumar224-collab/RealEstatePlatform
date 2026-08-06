<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyVisit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_users_cannot_manage_inquiries(): void
    {
        $this->getJson('/api/inquiries')
            ->assertUnauthorized();
    }

    public function test_buyers_cannot_manage_inquiries(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/inquiries')
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'Admin access required.',
            ]);
    }

    public function test_admins_can_manage_inquiries(): void
    {
        $property = Property::create([
            'title' => 'Inquiry Test Property',
            'description' => 'A property used to verify inquiry management access.',
            'price' => 1000000,
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'type' => 'buy',
            'category' => 'residential',
            'area' => 1000,
        ]);

        $inquiry = Inquiry::create([
            'property_id' => $property->id,
            'name' => 'Inquiry Contact',
            'email' => fake()->unique()->safeEmail(),
            'phone' => '9876543210',
            'message' => 'Please contact me about this property.',
            'status' => 'new',
        ]);

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/inquiries')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'inquiries',
            ])
            ->assertJsonFragment([
                'id' => $inquiry->id,
                'property_id' => $property->id,
                'name' => 'Inquiry Contact',
                'status' => 'new',
            ]);
    }

    public function test_unauthenticated_users_cannot_manage_property_visits(): void
    {
        $this->getJson('/api/property-visits')
            ->assertUnauthorized();
    }

    public function test_buyers_cannot_manage_property_visits(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/property-visits')
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'Admin access required.',
            ]);
    }

    public function test_admins_can_manage_property_visits(): void
    {
        $property = Property::create([
            'title' => 'Visit Test Property',
            'description' => 'A property used to verify visit management access.',
            'price' => 1500000,
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'type' => 'rent',
            'category' => 'residential',
            'area' => 1200,
        ]);

        $visit = PropertyVisit::create([
            'property_id' => $property->id,
            'name' => 'Visit Contact',
            'email' => fake()->unique()->safeEmail(),
            'phone' => '9876543210',
            'visit_date' => now()->addDay()->toDateString(),
            'visit_time' => '10:00:00',
            'notes' => 'Please arrange a morning visit.',
            'status' => 'pending',
        ]);

        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/property-visits')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'visits',
            ])
            ->assertJsonFragment([
                'id' => $visit->id,
                'property_id' => $property->id,
                'name' => 'Visit Contact',
                'status' => 'pending',
            ]);
    }

    public function test_registration_assigns_the_buyer_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Buyer User',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', User::ROLE_BUYER);
    }

    public function test_authenticated_user_response_includes_role(): void
    {
        $user = User::factory()->admin()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('role', User::ROLE_ADMIN);
    }
}
