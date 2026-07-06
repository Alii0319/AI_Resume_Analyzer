from rest_framework import serializers
from .models import Analysis

class AnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model = Analysis
        fields = '__all__'

class AnalysisHistorySerializer(serializers.ModelSerializer):

    job_title = serializers.CharField(source='job.title')
    company_name = serializers.CharField(source='job.company_name')
    missing_keywords_count = serializers.SerializerMethodField()

    class Meta:
        model = Analysis
        fields = ['id', 'score', 'job_title', 'company_name', 'created_at', 'missing_keywords_count']

    def get_missing_keywords_count(self, obj):
        return len(obj.missing_keywords) if obj.missing_keywords else 0

class AnalysisDetailSerializer(serializers.ModelSerializer):

    resume_title = serializers.CharField(source='resume.title')
    job_title = serializers.CharField(source='job.title')
    company_name = serializers.CharField(source='job.company_name')

    class Meta:
        model = Analysis
        fields = ['id', 'score', 'matched_keywords', 'missing_keywords', 'ai_suggestions', 'resume_title', 'job_title', 'company_name', 'created_at']