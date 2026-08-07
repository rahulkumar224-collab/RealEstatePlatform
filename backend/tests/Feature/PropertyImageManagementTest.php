<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PropertyImageManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_unauthenticated_user_cannot_upload_property_images(): void
    {
        $property = $this->createProperty();

        $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [$this->fakeImage('property.png')],
        ])->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_delete_property_image(): void
    {
        $property = $this->createProperty();
        $image = $this->createPropertyImage($property);

        $this->deleteJson($this->imageUrl($property, $image))
            ->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_make_property_image_primary(): void
    {
        $property = $this->createProperty();
        $image = $this->createPropertyImage($property);

        $this->putJson($this->imageUrl($property, $image) . '/primary')
            ->assertUnauthorized();
    }

    public function test_buyer_cannot_upload_property_images(): void
    {
        $property = $this->createProperty();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [$this->fakeImage('property.png')],
        ])
            ->assertForbidden()
            ->assertExactJson($this->adminAccessRequiredResponse());
    }

    public function test_buyer_cannot_delete_property_image(): void
    {
        $property = $this->createProperty();
        $image = $this->createPropertyImage($property);
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson($this->imageUrl($property, $image))
            ->assertForbidden()
            ->assertExactJson($this->adminAccessRequiredResponse());
    }

    public function test_buyer_cannot_make_property_image_primary(): void
    {
        $property = $this->createProperty();
        $image = $this->createPropertyImage($property);
        Sanctum::actingAs(User::factory()->create());

        $this->putJson($this->imageUrl($property, $image) . '/primary')
            ->assertForbidden()
            ->assertExactJson($this->adminAccessRequiredResponse());
    }

    public function test_admin_can_upload_multiple_property_images(): void
    {
        $property = $this->createProperty();
        $this->actingAsAdmin();

        $response = $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [
                $this->fakeImage('front.png'),
                $this->fakeImage('interior.png'),
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Property images uploaded successfully.')
            ->assertJsonPath('property_id', $property->id)
            ->assertJsonCount(2, 'images')
            ->assertJsonStructure([
                'success',
                'message',
                'property_id',
                'images' => [[
                    'id',
                    'image_path',
                    'image_url',
                    'is_primary',
                    'sort_order',
                ]],
            ]);

        foreach ($response->json('images') as $image) {
            $this->assertDatabaseHas('property_images', [
                'id' => $image['id'],
                'property_id' => $property->id,
                'image_path' => $image['image_path'],
            ]);
            Storage::disk('public')->assertExists($image['image_path']);
        }
    }

    public function test_first_upload_assigns_primary_and_sequential_sort_order(): void
    {
        $property = $this->createProperty();
        $this->actingAsAdmin();

        $response = $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [
                $this->fakeImage('first.png'),
                $this->fakeImage('second.png'),
                $this->fakeImage('third.png'),
            ],
        ])->assertCreated();

        $images = $response->json('images');
        $this->assertTrue($images[0]['is_primary']);
        $this->assertFalse($images[1]['is_primary']);
        $this->assertFalse($images[2]['is_primary']);
        $this->assertSame([0, 1, 2], array_column($images, 'sort_order'));
    }

    public function test_additional_upload_preserves_existing_primary_image(): void
    {
        $property = $this->createProperty();
        $primary = $this->createPropertyImage($property, true, 0);
        $this->actingAsAdmin();

        $response = $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [
                $this->fakeImage('additional-one.png'),
                $this->fakeImage('additional-two.png'),
            ],
        ])->assertCreated();

        $primary->refresh();
        $this->assertTrue($primary->is_primary);
        $this->assertFalse($response->json('images.0.is_primary'));
        $this->assertFalse($response->json('images.1.is_primary'));
        $this->assertSame(1, PropertyImage::where('property_id', $property->id)
            ->where('is_primary', true)
            ->count());
    }

    public function test_upload_after_sort_order_gap_uses_maximum_plus_one(): void
    {
        $property = $this->createProperty();
        $this->createPropertyImage($property, true, 0);
        $middle = $this->createPropertyImage($property, false, 1);
        $this->createPropertyImage($property, false, 2);
        $this->actingAsAdmin();

        $this->deleteJson($this->imageUrl($property, $middle))
            ->assertOk();

        $response = $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [$this->fakeImage('after-gap.png')],
        ])->assertCreated();

        $this->assertSame(3, $response->json('images.0.sort_order'));
        $sortOrders = PropertyImage::where('property_id', $property->id)
            ->pluck('sort_order');
        $this->assertSame($sortOrders->count(), $sortOrders->unique()->count());
    }

    public function test_upload_requires_images(): void
    {
        $property = $this->createProperty();
        $this->actingAsAdmin();

        $this->postJson('/api/properties/' . $property->id . '/images', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['images']);
    }

    public function test_upload_rejects_invalid_file_type(): void
    {
        $property = $this->createProperty();
        $this->actingAsAdmin();

        $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [
                UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['images.0']);
    }

    public function test_upload_rejects_oversized_image(): void
    {
        $property = $this->createProperty();
        $this->actingAsAdmin();

        $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => [
                $this->fakeImage('oversized.png', 5121),
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['images.0']);
    }

    public function test_upload_rejects_more_than_ten_images(): void
    {
        $property = $this->createProperty();
        $this->actingAsAdmin();
        $images = [];

        for ($index = 0; $index < 11; $index++) {
            $images[] = $this->fakeImage('property-' . $index . '.png');
        }

        $this->postJson('/api/properties/' . $property->id . '/images', [
            'images' => $images,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['images']);
    }

    public function test_admin_can_make_property_image_primary(): void
    {
        $property = $this->createProperty();
        $previousPrimary = $this->createPropertyImage($property, true, 0);
        $selectedImage = $this->createPropertyImage($property, false, 1);
        $this->actingAsAdmin();

        $this->putJson($this->imageUrl($property, $selectedImage) . '/primary')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Primary property image updated successfully.')
            ->assertJsonPath('image.id', $selectedImage->id)
            ->assertJsonPath('image.is_primary', true);

        $this->assertDatabaseHas('property_images', [
            'id' => $selectedImage->id,
            'is_primary' => true,
        ]);
        $this->assertDatabaseHas('property_images', [
            'id' => $previousPrimary->id,
            'is_primary' => false,
        ]);
    }

    public function test_make_primary_rejects_property_image_mismatch(): void
    {
        $property = $this->createProperty();
        $otherProperty = $this->createProperty('Other Property');
        $image = $this->createPropertyImage($otherProperty);
        $this->actingAsAdmin();

        $this->putJson($this->imageUrl($property, $image) . '/primary')
            ->assertNotFound()
            ->assertExactJson($this->imageMismatchResponse());
    }

    public function test_admin_can_delete_property_image_and_physical_file(): void
    {
        $property = $this->createProperty();
        $image = $this->createPropertyImage($property);
        $this->actingAsAdmin();

        $this->deleteJson($this->imageUrl($property, $image))
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'message' => 'Property image deleted successfully.',
            ]);

        $this->assertDatabaseMissing('property_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($image->image_path);
    }

    public function test_deleting_non_primary_image_preserves_current_primary(): void
    {
        $property = $this->createProperty();
        $primary = $this->createPropertyImage($property, true, 0);
        $secondary = $this->createPropertyImage($property, false, 1);
        $this->actingAsAdmin();

        $this->deleteJson($this->imageUrl($property, $secondary))
            ->assertOk();

        $primary->refresh();
        $this->assertTrue($primary->is_primary);
        $this->assertDatabaseMissing('property_images', ['id' => $secondary->id]);
    }

    public function test_deleting_primary_image_promotes_lowest_remaining_sort_order(): void
    {
        $property = $this->createProperty();
        $primary = $this->createPropertyImage($property, true, 0);
        $next = $this->createPropertyImage($property, false, 2);
        $last = $this->createPropertyImage($property, false, 5);
        $this->actingAsAdmin();

        $this->deleteJson($this->imageUrl($property, $primary))
            ->assertOk();

        $next->refresh();
        $last->refresh();
        $this->assertTrue($next->is_primary);
        $this->assertFalse($last->is_primary);
    }

    public function test_delete_rejects_property_image_mismatch(): void
    {
        $property = $this->createProperty();
        $otherProperty = $this->createProperty('Other Property');
        $image = $this->createPropertyImage($otherProperty);
        $this->actingAsAdmin();

        $this->deleteJson($this->imageUrl($property, $image))
            ->assertNotFound()
            ->assertExactJson($this->imageMismatchResponse());
    }

    public function test_unknown_property_and_image_ids_return_not_found(): void
    {
        $property = $this->createProperty();
        $image = $this->createPropertyImage($property);
        $this->actingAsAdmin();

        $this->postJson('/api/properties/999999/images', [
            'images' => [$this->fakeImage('property.png')],
        ])->assertNotFound();
        $this->deleteJson('/api/properties/' . $property->id . '/images/999999')
            ->assertNotFound();
        $this->putJson('/api/properties/' . $property->id . '/images/999999/primary')
            ->assertNotFound();
        $this->deleteJson('/api/properties/999999/images/' . $image->id)
            ->assertNotFound();
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
    }

    private function createProperty(string $title = 'Image Test Property'): Property
    {
        return Property::create([
            'title' => $title,
            'description' => 'A property used for image management tests.',
            'price' => 1250000,
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'type' => 'buy',
            'category' => 'residential',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'area' => 1500,
        ]);
    }

    private function createPropertyImage(
        Property $property,
        bool $isPrimary = false,
        int $sortOrder = 0
    ): PropertyImage {
        $path = 'properties/' . $property->id . '/image-'
            . $sortOrder . '-' . uniqid() . '.jpg';
        Storage::disk('public')->put($path, 'fake image contents');

        return PropertyImage::create([
            'property_id' => $property->id,
            'image_path' => $path,
            'is_primary' => $isPrimary,
            'sort_order' => $sortOrder,
        ]);
    }

    private function imageUrl(Property $property, PropertyImage $image): string
    {
        return '/api/properties/' . $property->id . '/images/' . $image->id;
    }

    private function fakeImage(
        string $name,
        ?int $sizeInKilobytes = null
    ): UploadedFile {
        $contents = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC'
            . 'AAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
            true
        );

        if ($sizeInKilobytes !== null) {
            $targetSize = $sizeInKilobytes * 1024;
            $contents .= str_repeat(
                "\0",
                max(0, $targetSize - strlen($contents))
            );
        }

        return UploadedFile::fake()->createWithContent($name, $contents);
    }

    /**
     * @return array{success: false, message: string}
     */
    private function adminAccessRequiredResponse(): array
    {
        return [
            'success' => false,
            'message' => 'Admin access required.',
        ];
    }

    /**
     * @return array{success: false, message: string}
     */
    private function imageMismatchResponse(): array
    {
        return [
            'success' => false,
            'message' => 'Image does not belong to this property.',
        ];
    }
}
