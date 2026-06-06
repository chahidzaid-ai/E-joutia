from django.db import models


class Listing(models.Model):
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('vehicles', 'Vehicles'),
        ('furniture', 'Furniture'),
        ('clothing', 'Clothing'),
        ('sports', 'Sports'),
        ('books', 'Books'),
        ('services', 'Services'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='DH')
    latitude = models.FloatField()
    longitude = models.FloatField()
    photo = models.URLField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.price} {self.currency}"
