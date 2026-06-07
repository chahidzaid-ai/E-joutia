from django.db import models


class Listing(models.Model):
    """A marketplace product listing with a geographic location."""

    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # `image` is optional so listings can be seeded without an uploaded file.
    image = models.ImageField(upload_to="listings/", blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.price})"
