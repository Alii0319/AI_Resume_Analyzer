from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from unittest.mock import patch

from analysis.services.nlp_matcher import nlp_matcher
from resumes.models import Resume
from jobs.models import Job
from analysis.models import Analysis

User = get_user_model()

class NLPMatcherTest(TestCase):
    def test_text_preprocessing(self):
        text = "Running and writing code in Python and React!"
        processed = nlp_matcher.preprocess_text(text)
        self.assertIn("python", processed)
        self.assertIn("react", processed)
        self.assertNotIn("and", processed.split())

    def test_keyword_extraction(self):
        job_description = "We are looking for a Senior Developer with expertise in Python, React, and AWS."
        keywords = nlp_matcher.extract_keywords_from_job(job_description)
        self.assertIn("python", keywords)
        self.assertIn("react", keywords)
        self.assertIn("aws", keywords)

    def test_calculate_similarity(self):
        resume = "Experienced software engineer specializing in Python and React development."
        job = "Looking for a React developer who also knows Python."
        score = nlp_matcher.calculate_similarity(resume, job)
        self.assertTrue(score > 0)
        self.assertTrue(score <= 100)

    def test_analyze_resume(self):
        resume = "Senior software engineer with skills in Python, Django, React, and AWS."
        job = "Seeking a developer skilled in Python, React, and Kubernetes."
        result = nlp_matcher.analyze_resume(resume, job)
        
        self.assertIn("score", result)
        self.assertIn("matched_keywords", result)
        self.assertIn("missing_keywords", result)
        
        self.assertIn("python", result["matched_keywords"])
        self.assertIn("react", result["matched_keywords"])
        self.assertIn("kubernetes", result["missing_keywords"])


class AnalysisViewIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="test@example.com", password="password123")
        self.client.force_authenticate(user=self.user)

    @patch('analysis.views.extract_text_from_pdf')
    @patch('analysis.views.generate_resume_suggestions')
    def test_run_analysis_view_success(self, mock_suggestions, mock_pdf_extract):
        # Setup mocks
        mock_pdf_extract.return_value = "Experienced Python and React software engineer."
        mock_suggestions.return_value = "Mocked AI suggestions: add some Kubernetes experience."

        # Create a dummy PDF file content
        pdf_file = SimpleUploadedFile("resume.pdf", b"dummy pdf content", content_type="application/pdf")

        # Run analysis POST request
        url = '/api/analysis/run/'
        data = {
            'file': pdf_file,
            'title': 'Senior Python Developer',
            'company_name': 'Tech Corp',
            'description': 'Looking for Python and React developer with Kubernetes skills.'
        }
        
        response = self.client.post(url, data, format='multipart')

        # Assert response status and structure
        self.assertEqual(response.status_code, 200)
        response_data = response.data
        self.assertIn("analysis_id", response_data)
        self.assertIn("score", response_data)
        self.assertIn("matched_keywords", response_data)
        self.assertIn("missing_keywords", response_data)
        self.assertIn("ai_suggestions", response_data)

        # Assert data was saved to database correctly
        analysis = Analysis.objects.get(id=response_data["analysis_id"])
        self.assertEqual(analysis.user, self.user)
        self.assertEqual(analysis.score, response_data["score"])
        self.assertEqual(analysis.ai_suggestions, "Mocked AI suggestions: add some Kubernetes experience.")
        self.assertEqual(analysis.resume.title, "resume")
        self.assertEqual(analysis.job.title, "Senior Python Developer")
