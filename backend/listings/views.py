from rest_framework import viewsets

from .models import Listing
from .serializers import ListingSerializer


class ListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing CRUD operations.
    Accepts optional query parameters:
    - user_lat: User's latitude for distance calculation
    - user_lon: User's longitude for distance calculation
    - max_distance: Maximum distance in km to filter results
    - category: Filter listings by category
    """
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user_lat = self.request.query_params.get('user_lat')
        user_lon = self.request.query_params.get('user_lon')

        if user_lat is not None:
            try:
                context['user_lat'] = float(user_lat)
            except (ValueError, TypeError):
                context['user_lat'] = None

        if user_lon is not None:
            try:
                context['user_lon'] = float(user_lon)
            except (ValueError, TypeError):
                context['user_lon'] = None

        return context

    def get_queryset(self):
        queryset = Listing.objects.all()

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        return queryset

    def filter_by_distance(self, listings):
        """Filter serialized listings by max_distance if provided."""
        max_distance = self.request.query_params.get('max_distance')
        if max_distance is None:
            return listings

        try:
            max_dist = float(max_distance)
        except (ValueError, TypeError):
            return listings

        return [
            listing for listing in listings
            if listing.get('distance') is not None and listing['distance'] <= max_dist
        ]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        filtered_data = self.filter_by_distance(serializer.data)

        # Return paginated response if pagination is configured
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            filtered_data = self.filter_by_distance(serializer.data)
            return self.get_paginated_response(filtered_data)

        from rest_framework.response import Response
        return Response(filtered_data)
