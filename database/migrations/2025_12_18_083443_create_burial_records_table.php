<?php

use App\Models\DeceasedRecord;
use App\Models\Lot;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('burial_records', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Lot::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(DeceasedRecord::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(User::class, 'created_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->date('burial_date');
            $table->time('burial_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('burial_records');
    }
};
