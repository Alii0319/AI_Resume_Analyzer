from django.urls import path
from .views import RunAnalysisView, AnalysisHistoryView, AnalysisDetailView, AnalysisExportView, UserStatsView

urlpatterns = [
    path('run/', RunAnalysisView.as_view()),
    path('history/', AnalysisHistoryView.as_view()),
    path('<int:pk>/', AnalysisDetailView.as_view()),
    path('<int:pk>/export/', AnalysisExportView.as_view()),
    path('stats/', UserStatsView.as_view()),
]