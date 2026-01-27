<?php

namespace App\Http\Controllers;

use App\Http\Resources\PathwayResource;
use App\Models\Pathway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PathwayController extends Controller
{
    public function index(): JsonResponse
    {
        $pathways = Pathway::with(['fromJunction', 'toJunction'])
                 ->get();

        return response()->json([
            'success' => true,
            'data' => PathwayResource::collection($pathways),
            'count' => $pathways->count(),
        ]);
    }
}
