# AGENTS.md - Cemetery Demo v3 Development Guide

This guide provides essential information for agentic coding agents working in this Laravel 12 + Vue 3 + Inertia.js application.

## Project Overview

- **Framework**: Laravel 12 with PHP 8.2+
- **Frontend**: Vue 3 + Inertia.js v2 + Tailwind CSS v4
- **Build Tool**: Vite 7
- **Testing**: Pest v3 + PHPUnit v11
- **Database**: MySQL (cemetery_demo_v3) with SQLite for tests
- **Mapping**: Leaflet integration for geographic features

## Essential Commands

### Development Environment
```bash
# Full development stack (server, queue, logs, Vite hot reload)
composer run dev

# Install and setup everything from scratch
composer setup

# Development server only
php artisan serve

# Frontend development with hot reload
npm run dev

# Production build
npm run build
```

### Testing Commands
```bash
# Run all tests
php artisan test

# Run tests in specific file
php artisan test tests/Feature/ExampleTest.php

# Run single test by name
php artisan test --filter="test name goes here"

# Run tests with coverage
php artisan test --coverage
```

### Code Quality
```bash
# Format PHP code (REQUIRED before finalizing changes)
vendor/bin/pint --dirty

# Run code style checker
vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php

# Check code style without fixing
vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php --dry-run --diff
```

### Laravel Artisan
```bash
# Create new model with factory and migration
php artisan make:model ModelName -mf

# Create controller with resource methods
php artisan make:controller ControllerName --resource

# create form request for validation
php artisan make:request RequestName

# Create Pest test
php artisan make:test --pest TestName

# Create feature test
php artisan make:test --pest Feature/TestName

# Create unit test
php artisan make:test --pest --unit Unit/TestName
```

## Code Style Guidelines

### PHP Standards
- **Constructor Promotion**: Use PHP 8 constructor property promotion
- **Type Declarations**: Always use explicit return types and parameter types
- **Curly Braces**: Always use braces for control structures, even single-line
- **PHPDoc**: Prefer PHPDoc blocks over inline comments
- **Naming**: Use descriptive names (`isRegisteredForDiscounts`, not `discount()`)

```php
// ✅ Good example
public function __construct(
    public UserRepository $userRepository,
    public LoggerInterface $logger
) {}

protected function isAccessible(User $user, ?string $path = null): bool
{
    return $user->canAccess($path);
}
```

### Laravel Conventions
- **Eloquent**: Use relationships over raw queries, prevent N+1 problems
- **Validation**: Use Form Request classes, never inline validation
- **Configuration**: Use `config()` not `env()` outside config files
- **Routes**: Use named routes and `route()` function for URL generation
- **Database**: Use migrations for all schema changes

### Vue 3 + Inertia.js Guidelines
- **Component Location**: Pages in `resources/js/Pages/`, components in `resources/js/Components/`
- **Forms**: Use `useForm` helper from Inertia v2
- **Props**: Use deferred props with skeleton loading states
- **Composition API**: Prefer Vue 3 Composition API over Options API

```javascript
// ✅ Form example
import { useForm } from '@inertiajs/vue3'

const form = useForm({
    name: '',
    email: '',
})

const submit = () => {
    form.post('/users')
}
```

### Tailwind CSS v4 Rules
- **Configuration**: CSS-first using `@theme` directive, no separate config file
- **Import**: Use `@import "tailwindcss"` not `@tailwind` directives
- **Spacing**: Use gap utilities for spacing, not margins
- **Dark Mode**: Support dark mode if existing pages do (use `dark:` prefix)
- **Deprecated Utilities**: Replace old opacity utilities (`bg-opacity-*` → `bg-black/*`)

```css
/* ✅ Tailwind v4 import */
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.72 0.11 178);
}
```

## File Structure & Conventions

### Directory Organization
```
app/
├── Http/
│   ├── Controllers/     # MVC controllers
│   └── Requests/        # Form validation classes
├── Models/              # Eloquent models
├── Console/Commands/     # Auto-registered artisan commands
└── Providers/           # Service providers

resources/js/
├── Pages/               # Inertia.js page components
├── Components/          # Reusable Vue components
├── composables/         # Vue composables
└── stores/              # State management

tests/
├── Feature/             # Integration/end-to-end tests
└── Unit/                # Isolated unit tests
```

### Laravel 12 Specific Structure
- **No Middleware Files**: Middleware registered in `bootstrap/app.php`
- **Auto-registered Commands**: Files in `app/Console/Commands/` work automatically
- **No Console Kernel**: Use `bootstrap/app.php` or `routes/console.php`
- **Streamlined**: Follow existing patterns, don't create new base folders

## Testing Standards

### Pest Test Structure
```php
// ✅ Basic Pest test
it('creates a user successfully', function () {
    $user = User::factory()->create();
    
    $response = $this->post('/users', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
});
```

### Testing Best Practices
- **Factory Usage**: Always use factories for test data
- **Specific Assertions**: Use `assertForbidden()`, `assertNotFound()` not `assertStatus(403)`
- **Minimal Test Runs**: Use filters to run only relevant tests during development
- **Datasets**: Use datasets for validation rule testing
- **Mocking**: Import `use function Pest\Laravel\mock;` for mocks

### Running Single Tests
```bash
# Filter by test name
php artisan test --filter="creates a user successfully"

# Run entire test file
php artisan test tests/Feature/UserTest.php

# Run with verbose output
php artisan test --filter="test name" --verbose
```

## Development Workflow

### Before Making Changes
1. Search for existing components/functionality to reuse
2. Check sibling files for naming and structural conventions
3. Use documentation search tools for Laravel ecosystem packages

### After Making Changes
1. **REQUIRED**: Run `vendor/bin/pint --dirty` to format PHP code
2. Run relevant tests to ensure functionality works
3. If frontend changes are involved, run `npm run dev` or `npm run build`
4. Test in browser if UI changes were made

### Database Operations
- **Migrations**: Always include all column attributes when modifying
- **Eager Loading**: Prevent N+1 queries with `with()` or `load()`
- **Factories**: Create factories and seeders for new models
- **Testing**: Use SQLite in-memory database (`:memory:`) for tests

## Common Issues & Solutions

### Vite Build Errors
If you see "Unable to locate file in Vite manifest":
```bash
npm run build
# or
npm run dev
```

### Frontend Changes Not Visible
```bash
npm run dev
# or for full stack
composer run dev
```

### Test Database Issues
Tests use SQLite in-memory database automatically. No setup needed.

### Code Style Enforcement
Code must pass Laravel Pint formatting. Run `vendor/bin/pint --dirty` before finalizing.

## Important Notes

- **No Documentation Files**: Don't create README or documentation unless explicitly requested
- **Dependency Changes**: Do not modify dependencies without approval
- **Existing Patterns**: Always check existing code before creating new patterns
- **Concise Replies**: Be brief and focus on what's important
- **Search First**: Use documentation search tools for Laravel ecosystem questions

## Package Versions

Critical packages and their versions:
- Laravel: v12
- Inertia.js: v2
- Vue: v3.5+
- Tailwind CSS: v4
- Pest: v3
- PHPUnit: v11
- Vite: v7

This project follows modern PHP/JavaScript best practices with comprehensive tooling for code quality and testing.