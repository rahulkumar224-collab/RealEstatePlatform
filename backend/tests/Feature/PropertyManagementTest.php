<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyVisit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
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

    public function test_unauthenticated_user_cannot_update_property(): void
    {
        $property = Property::create($this->validPayload());

        $this->putJson('/api/properties/' . $property->id, $this->validPayload())
            ->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_delete_property(): void
    {
        $property = Property::create($this->validPayload());

        $this->deleteJson('/api/properties/' . $property->id)
            ->assertUnauthorized();
    }

    public function test_authenticated_buyer_cannot_update_property(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->create());

        $this->patchJson('/api/properties/' . $property->id, [
            'title' => 'Buyer Update',
        ])
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'Admin access required.',
            ]);
    }

    public function test_authenticated_buyer_cannot_delete_property(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson('/api/properties/' . $property->id)
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'Admin access required.',
            ]);
    }

    public function test_admin_can_fully_update_property_with_put(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());
        $updatedPayload = [
            'title' => 'Updated Property',
            'description' => 'The complete updated property description.',
            'price' => 2500000,
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'type' => 'rent',
            'category' => 'commercial',
            'bedrooms' => 0,
            'bathrooms' => 3,
            'area' => 2200,
            'image' => 'https://example.com/updated-property.jpg',
        ];

        $this->putJson('/api/properties/' . $property->id, $updatedPayload)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Property updated successfully.')
            ->assertJsonPath('property.id', $property->id)
            ->assertJsonPath('property.title', $updatedPayload['title'])
            ->assertJsonPath('property.description', $updatedPayload['description'])
            ->assertJsonPath('property.price', $updatedPayload['price'])
            ->assertJsonPath('property.city', $updatedPayload['city'])
            ->assertJsonPath('property.state', $updatedPayload['state'])
            ->assertJsonPath('property.type', $updatedPayload['type'])
            ->assertJsonPath('property.category', $updatedPayload['category'])
            ->assertJsonPath('property.bedrooms', $updatedPayload['bedrooms'])
            ->assertJsonPath('property.bathrooms', $updatedPayload['bathrooms'])
            ->assertJsonPath('property.area', $updatedPayload['area'])
            ->assertJsonPath('property.image', $updatedPayload['image']);

        $this->assertDatabaseHas('properties', array_merge(
            ['id' => $property->id],
            $updatedPayload
        ));
    }

    public function test_put_requires_complete_property_payload(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson('/api/properties/' . $property->id, [
            'title' => 'Incomplete Property',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'description',
                'price',
                'city',
                'state',
                'type',
                'category',
                'area',
            ]);
    }

    public function test_admin_can_partially_update_property_with_patch(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->patchJson('/api/properties/' . $property->id, [
            'title' => 'Partially Updated Property',
            'price' => 1750000,
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Property updated successfully.')
            ->assertJsonPath('property.title', 'Partially Updated Property')
            ->assertJsonPath('property.price', 1750000)
            ->assertJsonPath('property.city', $property->city)
            ->assertJsonPath('property.area', $property->area);

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'title' => 'Partially Updated Property',
            'price' => 1750000,
            'city' => $property->city,
            'area' => $property->area,
        ]);
    }

    public function test_patch_protects_required_property_fields(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->patchJson('/api/properties/' . $property->id, [
            'title' => null,
            'price' => null,
            'area' => 0,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'price', 'area']);
    }

    public function test_patch_allows_nullable_optional_property_fields(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->patchJson('/api/properties/' . $property->id, [
            'bedrooms' => null,
            'bathrooms' => null,
            'image' => null,
        ])
            ->assertOk()
            ->assertJsonPath('property.bedrooms', null)
            ->assertJsonPath('property.bathrooms', null)
            ->assertJsonPath('property.image', null);

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'bedrooms' => null,
            'bathrooms' => null,
            'image' => null,
        ]);
    }

    public function test_update_rejects_invalid_enums_and_numeric_values(): void
    {
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->patchJson('/api/properties/' . $property->id, [
            'type' => 'sale',
            'category' => 'industrial',
            'price' => 0,
            'area' => 0,
            'bedrooms' => -1,
            'bathrooms' => -1,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'type',
                'category',
                'price',
                'area',
                'bedrooms',
                'bathrooms',
            ]);
    }

    public function test_admin_can_delete_property(): void
    {
        Storage::fake('public');
        $property = Property::create($this->validPayload());
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson('/api/properties/' . $property->id)
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'message' => 'Property deleted successfully.',
            ]);

        $this->assertDatabaseMissing('properties', ['id' => $property->id]);
    }

    public function test_property_delete_cascades_related_database_rows(): void
    {
        Storage::fake('public');
        $property = Property::create($this->validPayload());
        $image = PropertyImage::create([
            'property_id' => $property->id,
            'image_path' => 'properties/' . $property->id . '/image.jpg',
            'is_primary' => true,
            'sort_order' => 0,
        ]);
        $inquiry = Inquiry::create([
            'property_id' => $property->id,
            'name' => 'Cascade Inquiry',
            'email' => 'inquiry@example.com',
            'phone' => '9876543210',
            'message' => 'Please share more information.',
            'status' => 'new',
        ]);
        $visit = PropertyVisit::create([
            'property_id' => $property->id,
            'name' => 'Cascade Visit',
            'email' => 'visit@example.com',
            'phone' => '9876543210',
            'visit_date' => now()->addDay()->toDateString(),
            'visit_time' => '10:00:00',
            'notes' => null,
            'status' => 'pending',
        ]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson('/api/properties/' . $property->id)
            ->assertOk();

        $this->assertDatabaseMissing('property_images', ['id' => $image->id]);
        $this->assertDatabaseMissing('inquiries', ['id' => $inquiry->id]);
        $this->assertDatabaseMissing('property_visits', ['id' => $visit->id]);
    }

    public function test_property_delete_removes_physical_image_directory(): void
    {
        Storage::fake('public');
        $property = Property::create($this->validPayload());
        $firstPath = 'properties/' . $property->id . '/first.jpg';
        $secondPath = 'properties/' . $property->id . '/nested/second.png';
        Storage::disk('public')->put($firstPath, 'first image');
        Storage::disk('public')->put($secondPath, 'second image');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson('/api/properties/' . $property->id)
            ->assertOk();

        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertMissing($secondPath);
    }

    public function test_unknown_property_update_and_delete_return_not_found(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->patchJson('/api/properties/999999', ['title' => 'Missing'])
            ->assertNotFound();
        $this->deleteJson('/api/properties/999999')
            ->assertNotFound();
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
