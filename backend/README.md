# E-Joutia Backend

Django REST API for the E-Joutia marketplace application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

## API Endpoints

### Listings

- `GET /api/listings/` - List all listings
- `POST /api/listings/` - Create a new listing
- `GET /api/listings/{id}/` - Retrieve a listing
- `PUT /api/listings/{id}/` - Update a listing
- `DELETE /api/listings/{id}/` - Delete a listing

### Query Parameters

- `user_lat` - User latitude for distance calculation
- `user_lon` - User longitude for distance calculation
- `max_distance` - Filter by maximum distance (km)
- `category` - Filter by category (electronics, vehicles, furniture, clothing, sports, books, services, other)

### Example

```
GET /api/listings/?user_lat=33.5731&user_lon=-7.5898&max_distance=5&category=electronics
```
