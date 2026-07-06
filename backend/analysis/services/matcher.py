def analyze_resume(resume_text, job_keywords):
    resume_text = resume_text.lower()

    matched = []
    missing = []

    for keyword in job_keywords:
        if keyword.lower() in resume_text:
            matched.append(keyword)
        else:
            missing.append(keyword)

    score = int((len(matched) / len(job_keywords)) * 100) if job_keywords else 0

    return {
        "score": score,
        "matched": matched,
        "missing": missing
    }