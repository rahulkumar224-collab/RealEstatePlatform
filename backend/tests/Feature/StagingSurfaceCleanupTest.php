<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StagingSurfaceCleanupTest extends TestCase
{
    use RefreshDatabase;

    public function test_staging_surface_excludes_scaffold_routes_without_breaking_application_routing(): void
    {
        $this->get('/api/test')->assertNotFound();
        $this->get('/')->assertNotFound();

        $this->get('/up')->assertOk();
        $this->getJson('/api/properties')->assertOk();
    }
}
