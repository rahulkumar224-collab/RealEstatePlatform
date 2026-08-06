<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->string('phone')->nullable()->after('email');

            $table->string('role')
                ->default('buyer')
                ->after('phone');

            $table->string('avatar')
                ->nullable()
                ->after('role');

            $table->text('address')
                ->nullable()
                ->after('avatar');

            $table->string('city')
                ->nullable()
                ->after('address');

            $table->string('state')
                ->nullable()
                ->after('city');

            $table->string('country')
                ->default('India')
                ->after('state');

            $table->boolean('is_verified')
                ->default(false)
                ->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropColumn([
                'phone',
                'role',
                'avatar',
                'address',
                'city',
                'state',
                'country',
                'is_verified',
            ]);
        });
    }
};
