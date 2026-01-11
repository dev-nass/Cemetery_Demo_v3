<?php

use App\Http\Controllers\LotController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('WelcomeView');
});

Route::get('/map', fn() => Inertia::render('MapView'));
Route::get('/practice-map', fn() => Inertia::render('PracticeMapView'));

Route::controller(LotController::class)->prefix('lot')
    ->group(function () {
        Route::get('/search', 'search')->name('lots.search');
        Route::get('/lotsGeojson', 'lotsGeoJson')->name('lots.geojson');
        Route::get('/sectionsGeojson', 'sectionsGeoJson')->name('sections.geojson');
    });
