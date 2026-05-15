import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Download required NLTK data (run once)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class NLPMatcher:
    """
    Professional NLP-based resume-job matching using TF-IDF and Cosine Similarity.

    This class provides ATS-style resume analysis with:
    - Text preprocessing (lowercasing, punctuation removal, stopword removal, lemmatization)
    - TF-IDF vectorization for semantic understanding
    - Cosine similarity scoring for match percentage
    - Keyword extraction and comparison
    """

    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        # Add common job-related stopwords that should be kept
        self.stop_words.discard('c')
        self.stop_words.discard('c++')
        self.stop_words.discard('java')
        self.stop_words.discard('python')
        self.stop_words.discard('javascript')
        self.stop_words.discard('react')
        self.stop_words.discard('node')
        self.stop_words.discard('sql')
        self.stop_words.discard('aws')
        self.stop_words.discard('docker')
        self.stop_words.discard('kubernetes')

    def preprocess_text(self, text):
        """
        Preprocess text for NLP analysis.

        Args:
            text (str): Raw text to preprocess

        Returns:
            str: Preprocessed text
        """
        # Convert to lowercase
        text = text.lower()

        # Remove punctuation and special characters (keep alphanumeric, spaces, and common tech chars)
        text = re.sub(r'[^\w\s+\-\.#]', ' ', text)

        # Tokenize
        words = text.split()

        # Remove stopwords and lemmatize
        processed_words = []
        for word in words:
            if word not in self.stop_words and len(word) > 2:
                # Lemmatize to get base form
                lemma = self.lemmatizer.lemmatize(word)
                processed_words.append(lemma)

        return ' '.join(processed_words)

    def extract_keywords_from_job(self, job_description):
        """
        Extract technical skills and keywords from job description.

        Args:
            job_description (str): Full job description text

        Returns:
            list: List of extracted keywords
        """
        # Common technical skill patterns
        tech_patterns = [
            r'\b(?:python|java|javascript|c\+\+|c#|ruby|php|go|rust|swift|kotlin|scala|perl|r)\b',
            r'\b(?:react|angular|vue|node\.js|express|django|flask|spring|laravel|rails)\b',
            r'\b(?:sql|mysql|postgresql|mongodb|redis|cassandra|elasticsearch)\b',
            r'\b(?:aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github)\b',
            r'\b(?:machine learning|ai|nlp|computer vision|deep learning|tensorflow|pytorch)\b',
            r'\b(?:agile|scrum|kanban|devops|ci/cd|tdd|bdd)\b'
        ]

        keywords = set()

        # Extract from patterns
        for pattern in tech_patterns:
            matches = re.findall(pattern, job_description.lower())
            keywords.update(matches)

        # Extract additional keywords from preprocessed text
        processed = self.preprocess_text(job_description)
        words = processed.split()

        # Filter for potential skills (longer words, proper nouns, etc.)
        for word in words:
            if len(word) > 3 and not word.isdigit():
                # Check if it looks like a technical term
                if any(char in word for char in ['+', '#', '.', '-']):
                    keywords.add(word)
                elif word[0].isupper():  # Potential proper nouns
                    keywords.add(word.lower())

        return list(keywords)

    def calculate_similarity(self, resume_text, job_description):
        """
        Calculate similarity score between resume and job description using TF-IDF and cosine similarity.

        Args:
            resume_text (str): Preprocessed resume text
            job_description (str): Preprocessed job description text

        Returns:
            float: Similarity score (0-100)
        """
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),  # Include bigrams
            min_df=1,
            max_df=0.9
        )

        try:
            # Fit and transform both texts
            tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])

            # Calculate cosine similarity
            similarity_matrix = cosine_similarity(tfidf_matrix)

            # Get similarity score between resume and job (index 0 and 1)
            similarity_score = similarity_matrix[0][1]

            # Convert to percentage
            return round(similarity_score * 100, 2)

        except ValueError:
            # Fallback if vectorization fails
            return 0.0

    def analyze_resume(self, resume_text, job_description):
        """
        Main analysis function - compatible with existing frontend API.

        Args:
            resume_text (str): Raw resume text
            job_description (str): Raw job description text

        Returns:
            dict: Analysis results with score, matched_keywords, missing_keywords
        """
        # Preprocess both texts
        processed_resume = self.preprocess_text(resume_text)
        processed_job = self.preprocess_text(job_description)

        # Extract keywords from job description
        job_keywords = self.extract_keywords_from_job(job_description)

        # Calculate similarity score
        score = self.calculate_similarity(processed_resume, processed_job)

        # Find matched and missing keywords
        matched_keywords = []
        missing_keywords = []

        for keyword in job_keywords:
            # Check if keyword appears in processed resume
            if keyword.lower() in processed_resume:
                matched_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)

        return {
            "score": score,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords
        }


# Global instance for reuse
nlp_matcher = NLPMatcher()

def analyze_resume_nlp(resume_text, job_description):
    """
    Convenience function for backward compatibility.

    Args:
        resume_text (str): Raw resume text
        job_description (str): Raw job description text

    Returns:
        dict: Analysis results
    """
    return nlp_matcher.analyze_resume(resume_text, job_description)