<?php

use App\Models\Section;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Section::class)->constrained()->onDelete('cascade');
            $table->string('lot_number')->unique();
            $table->enum('lot_type', ['underground', 'apartment', 'columbarium']);
            $table->enum('status', ['available', 'occupied', 'reservedd'])->default('available');
            $table->json('coordinates');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};
