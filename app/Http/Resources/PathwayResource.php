<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PathwayResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_junction_id' => $this->from_junction_id,
            'to_junction_id' => $this->to_junction_id,
            'distance_meters' => (float) $this->distance_meters,
            'coordinates' => json_decode($this->coordinates, true), // Parse JSON to array
        ];
    }
}
