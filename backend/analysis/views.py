import io

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import models

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView, RetrieveAPIView

from resumes.models import Resume
from resumes.services.parser import extract_text_from_pdf

from jobs.models import Job
from jobs.services.keyword_extractor import extract_keywords

from .models import Analysis
from .services.nlp_matcher import analyze_resume_nlp as analyze_resume
from .services.ai_service import generate_resume_suggestions
from .serializers import AnalysisHistorySerializer, AnalysisDetailSerializer


class RunAnalysisView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        title = request.data.get('title')
        company_name = request.data.get('company_name')
        description = request.data.get('description')

        if not file:
            return Response({"error": "PDF file required"}, status=400)

        if not title or not description:
            return Response({"error": "Title and description required"}, status=400)

        if not file.name.endswith('.pdf'):
            return Response({"error": "Only PDF files allowed"}, status=400)

        resume = Resume.objects.create(
            user=request.user,
            title=file.name.replace('.pdf', ''),
            file=file
        )

        parsed_text = extract_text_from_pdf(resume.file.path)
        resume.parsed_text = parsed_text
        resume.save()

        keywords = extract_keywords(description)

        job = Job.objects.create(
            user=request.user,
            title=title,
            company_name=company_name,
            description=description,
            keywords=keywords
        )

        result = analyze_resume(parsed_text, description)
        ai_suggestions = generate_resume_suggestions(result['missing_keywords'], parsed_text)

        analysis = Analysis.objects.create(
            user=request.user,
            resume=resume,
            job=job,
            score=result['score'],
            matched_keywords=result['matched_keywords'],
            missing_keywords=result['missing_keywords'],
            ai_suggestions=ai_suggestions
        )

        return Response({
            "analysis_id": analysis.id,
            "score": analysis.score,
            "matched_keywords": analysis.matched_keywords,
            "missing_keywords": analysis.missing_keywords,
            "ai_suggestions": analysis.ai_suggestions
        })


class AnalysisHistoryView(ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = AnalysisHistorySerializer

    def get_queryset(self):
        return Analysis.objects.filter(user=self.request.user).order_by('-created_at')


class AnalysisDetailView(RetrieveAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = AnalysisDetailSerializer

    def get_queryset(self):
        return Analysis.objects.filter(user=self.request.user)


class AnalysisExportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        analysis = get_object_or_404(Analysis, pk=pk, user=request.user)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )

        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph('Resume Analysis Report', styles['Title']))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f'<b>Job Title:</b> {analysis.job.title}', styles['Normal']))
        story.append(Paragraph(f'<b>Company:</b> {analysis.job.company_name}', styles['Normal']))
        story.append(Paragraph(f'<b>ATS Score:</b> {analysis.score}%', styles['Normal']))
        story.append(Spacer(1, 12))

        story.append(Paragraph('<b>Matched Skills</b>', styles['Heading3']))
        story.append(Paragraph(', '.join(analysis.matched_keywords or []) or 'None', styles['Normal']))
        story.append(Spacer(1, 12))

        story.append(Paragraph('<b>Missing Skills</b>', styles['Heading3']))
        story.append(Paragraph(', '.join(analysis.missing_keywords or []) or 'None', styles['Normal']))
        story.append(Spacer(1, 12))

        story.append(Paragraph('<b>AI Suggestions</b>', styles['Heading3']))
        story.append(Paragraph(analysis.ai_suggestions or 'No suggestions available.', styles['Normal']))

        doc.build(story)
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="analysis-report-{analysis.id}.pdf"'
        return response


class UserStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_analyses = Analysis.objects.filter(user=request.user)

        total_analyses = user_analyses.count()
        avg_score = user_analyses.aggregate(avg_score=models.Avg('score'))['avg_score'] or 0

        return Response({
            'total_analyses': total_analyses,
            'avg_score': round(avg_score, 1) if avg_score else 0
        })
