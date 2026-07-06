from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer
from .services.keyword_extractor import extract_keywords

class JobCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JobSerializer(data=request.data)

        if serializer.is_valid():
            job = serializer.save(user=request.user)

            # extract keywords
            keywords = extract_keywords(job.description)
            job.keywords = keywords
            job.save()

            return Response({
                "message": "Job created",
                "job_id": job.id,
                "keywords": keywords[:20]  # preview
            })

        return Response(serializer.errors, status=400)