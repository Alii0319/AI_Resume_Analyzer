import re

STOPWORDS = [
    "and", "or", "the", "a", "an", "to", "for", "of", "in", "on", "with",
    "is", "are", "as", "by", "at", "from"
]

def extract_keywords(text):
    # lowercase
    text = text.lower()

    # remove special chars
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)

    words = text.split()

    # remove stopwords
    keywords = [word for word in words if word not in STOPWORDS and len(word) > 2]

    # unique keywords
    return list(set(keywords))