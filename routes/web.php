<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('WelcomeView');
});

Route::get('/map', fn() => Inertia::render('MapView'));
