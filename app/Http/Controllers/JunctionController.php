<?php

namespace App\Http\Controllers;

use App\Http\Resources\JunctionResource;
use App\Models\Junction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JunctionController extends Controller
{
    /**
    * Get all junctions
    * */
    public function index(): JsonResponse
    {
        $junctions = Junction::all();

        return response()->json([
            'success' => true,
            'data' => JunctionResource::collection($junctions),
            'count' => $junctions->count(),
        ]);
    }
}
