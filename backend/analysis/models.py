from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Analysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.ForeignKey('resumes.Resume', on_delete=models.CASCADE)
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE)

    ai_suggestions = models.TextField(blank=True, null=True)

    score = models.IntegerField(default=0)
    matched_keywords = models.JSONField(blank=True, null=True)
    missing_keywords = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis {self.id}"