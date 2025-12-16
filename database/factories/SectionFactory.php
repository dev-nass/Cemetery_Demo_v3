<?php

namespace Database\Factories;

use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Section>
 */
class SectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'section_code' => $this->faker->unique()->numberBetween(100, 999),
            'section_name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'total_capacity' => $this->faker->numberBetween(50, 200),
            'status' => 'active',
        ];
    }
}
