<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PropertyManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_create_property(): void
    {
        $this->postJson('/api/properties', $this->validPayload())
            ->assertUnauthorized();
    }

    public function test_authenticated_buyer_cannot_create_property(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/properties', $this->validPayload())
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'Admin access required.',
            ]);
    }

    public function test_authenticated_admin_can_create_valid_property(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $payload = $this->validPayload();

        $this->postJson('/api/properties', $payload)
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Property created successfully.')
            ->assertJsonPath('property.title', $payload['title'])
            ->assertJsonPath('property.description', $payload['description'])
            ->assertJsonPath('property.price', $payload['price'])
            ->assertJsonPath('property.city', $payload['city'])
            ->assertJsonPath('property.state', $payload['state'])
            ->assertJsonPath('property.type', $payload['type'])
            ->assertJsonPath('property.category', $payload['category'])
            ->assertJsonPath('property.bedrooms', $payload['bedrooms'])
            ->assertJsonPath('property.bathrooms', $payload['bathrooms'])
            ->assertJsonPath('property.area', $payload['area'])
            ->assertJsonPath('property.image', $payload['image']);

        $this->assertDatabaseHas('properties', $payload);
    }

    public function test_required_fields_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/properties', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'description',
                'price',
                'city',
                'state',
                'type',
                'category',
                'area',
            ]);
    }

    public function test_property_enums_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/properties', array_merge($this->validPayload(), [
            'type' => 'sale',
            'category' => 'industrial',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type', 'category']);
    }

    public function test_property_numeric_fields_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/properties', array_merge($this->validPayload(), [
            'price' => 0,
            'area' => 0,
            'bedrooms' => -1,
            'bathrooms' => -1,
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'price',
                'area',
                'bedrooms',
                'bathrooms',
            ]);
    }

    public function test_bedrooms_bathrooms_and_image_are_nullable(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $payload = $this->validPayload();
        unset($payload['bedrooms'], $payload['bathrooms'], $payload['image']);

        $response = $this->postJson('/api/properties', $payload)
            ->assertCreated();

        $this->assertDatabaseHas('properties', [
            'id' => $response->json('property.id'),
            'bedrooms' => null,
            'bathrooms' => null,
            'image' => null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'title' => 'Admin Created Property',
            'description' => 'A property created through the admin API.',
            'price' => 1250000,
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'type' => 'buy',
            'category' => 'residential',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'area' => 1500,
            'image' => 'https://example.com/property.jpg',
        ];
    }
}
