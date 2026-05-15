from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Job(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    keywords = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title