import math

from rest_framework import serializers

from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'description',
            'price',
            'currency',
            'latitude',
            'longitude',
            'photo',
            'created_at',
            'category',
            'distance',
        ]

    def get_distance(self, obj):
        """
        Calculate distance between the listing and user position
        using the Haversine formula. Returns distance in kilometers.
        """
        user_lat = self.context.get('user_lat')
        user_lon = self.context.get('user_lon')

        if user_lat is None or user_lon is None:
            return None

        lat1 = math.radians(user_lat)
        lat2 = math.radians(obj.latitude)
        dlat = math.radians(obj.latitude - user_lat)
        dlon = math.radians(obj.longitude - user_lon)

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        # Earth's radius in kilometers
        radius = 6371.0
        distance = radius * c

        return round(distance, 2)
