from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Resume
from .serializers import ResumeSerializer
from .services.parser import extract_text_from_pdf


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        title = request.data.get('title')

        if not file or not title:
            return Response({"error": "Title and PDF file are required"},status=400)
              
        if not file.name.endswith('.pdf'):
            return Response({"error": "Only PDF files are allowed"},status=400)

        resume = Resume.objects.create(
            user=request.user,
            title=title,
            file=file
        )

        # Extract text
        text = extract_text_from_pdf(resume.file.path)
        resume.parsed_text = text
        resume.save()

        return Response({
            "message": "Resume uploaded successfully",
            "resume_id": resume.id
        })