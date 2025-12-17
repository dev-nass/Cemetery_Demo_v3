<?php

use App\Http\Controllers\LotController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('WelcomeView');
});

Route::get('/map', fn() => Inertia::render('MapView'));

Route::controller(LotController::class)
    ->prefix('lot')
    ->group(function () {
        Route::get('/geojson', 'geoJson')->name('lots.geojson');
    });
