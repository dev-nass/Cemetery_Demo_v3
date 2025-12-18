<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeceasedRecord>
 */
class DeceasedRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'middle_name' => $this->faker->optional()->firstName(),
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $this->faker->optional()->date(),
            'date_of_death' => $this->faker->date(),
            'cause_of_death' => $this->faker->optional()->sentence(3),
            'place_of_death' => $this->faker->optional()->city(),
        ];
    }
}
