WORK_EXPERIENCE_HEADINGS = [
    r"professional experience",
    r"work experience",
    r"experience",
    r"employment history",
    r"work history",
    r"professional history",
    r"career history",
    r"professional background",
    r"relevant experience",
    r"work background",
    r"employment experience",
    r"job history",
    r"occupational history",
    r"related experience",
    r"professional track record",
    r"employment record",
    r"work track record",
    r"employment background",
    r"career background",
    r"professional record",
    r"work record",
    r"employment profile",
    r"professional summary",
    r"work summary",
    r"professional achievements",
    r"key experience",
    r"key accomplishments",
    r"relevant background",
    r"professional synopsis",
    r"experience details",
    r"professional details",
    r"related professional experience",
    r"related work experience",
    r"related career experience",
    r"relevant professional experience",
    r"relevant work experience",
    r"relevant career experience",
    r"employment summary",
    r"work summary",
    r"career summary",
    r"professional experience and skills",
    r"work experience and skills",
    r"career experience and skills",
    r"professional experience and qualifications",
    r"work experience and qualifications",
    r"career experience and qualifications",
    r"professional experience and achievements",
    r"work experience and achievements",
    r"career experience and achievements"
    ]

EVERY_OTHER_HEADING_REGEX = r"(education|qualification|hobbies|interests|references|projects|certifications|skills|awards|achievements|publications|publications and presentations|presentations|extracurricular activities|extracurricular|languages|technical skills|technical|personal skills|personal|summary|objective|career objective|career summary|career|summary of qualifications|summary of qualifications|summary of quali)"

DATE_REGEX = r'\b(?:\d{1,2}[\/.-])?(?:(?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2]))[\/.-]?\d{2,4}\b|\b(?:0?[1-9]|1[0-2])[\/.-]\d{4}\b|\b\d{4}[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12]\d|3[01])\b|\b(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-]\d{4}\b|\b(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-]\d{2}(?!\d)\b|\b\d{1,2}[\/.-][A-Za-z]{3,9}[\/.-]\d{4}\b|\b[A-Za-z]{3,9}[\/.-]\d{1,2}[\/.-]\d{4}\b'

DATE_FORMATS_BY_REGEX = {
        '%d/%m/%Y': ['%d-%m-%Y', '%d.%m.%Y', '%d/%m/%y', '%d %m %Y', '%d-%m-%y', '%d.%m.%y', '%d %b %Y', '%d %B %Y', '%d/%B/%Y', '%d-%B-%y', '%d.%B.%y', '%d %B %y', '%d-%b-%y', '%d.%b.%y', '%d %b %y'],
        '%Y-%m-%d': ['%Y-%m-%d', '%Y %m %d', '%Y.%m.%d', '%Y/%m/%d', '%Y-%m-%y', '%Y.%m.%y', '%Y %b %d', '%Y %B %d', '%Y-%B-%d', '%Y.%B.%d', '%Y %b %d', '%Y-%b-%d', '%Y.%b.%d'],
        '%d-%B-%Y': ['%d-%B-%Y', '%d-%b-%Y', '%d %B %Y', '%d %b %Y', '%d/%B/%Y', '%d %B, %Y', '%d %b, %Y', '%d-%B-%y', '%d.%B.%y', '%d %B %y', '%d-%b-%y', '%d.%b.%y', '%d %b %y'],
        '%B-%d-%Y': ['%B-%d-%Y', '%b-%d-%Y', '%B %d %Y', '%b %d %Y', '%B/%d/%Y', '%B %d, %Y', '%b %d, %Y', '%B-%d-%y', '%B.%d.%y', '%B %d %y', '%b-%d-%y', '%b.%d.%y', '%b %d %y'],
        '%m/%Y': ['%m/%Y', '%m-%y', '%b %Y', '%B %Y', '%b-%Y', '%B-%Y', '%b.%Y', '%B.%Y'],
        '%Y-%m': ['%Y-%m', '%Y %m', '%Y.%m', '%Y/%m', '%y-%m', '%y %m', '%y.%m', '%y/%m', '%B-%Y', '%B/%Y', '%b-%Y', '%b/%Y', '%B.%Y', '%b.%Y'],
        '%m/%y': ['%m/%y', '%b %y', '%B %y', '%b-%y', '%B-%y', '%b.%y', '%B.%y'],
        '%B-%Y': ['%B-%Y', '%b-%Y', '%B %Y', '%b %Y', '%B/%Y', '%b/%Y', '%B.%Y', '%b.%Y'],
        '%Y-%B': ['%Y-%B', '%Y-%b', '%Y %B', '%Y %b', '%Y/%B', '%Y/%b', '%Y.%B', '%Y.%b']
    }

LINKS_REGEX = r"""
    (?P<url>                           # named group for URL
    (?:https?://)                     # URL prefix
    [\w-]+(?:\.[\w-]+)*              # domain name
    (?::\d+)?                         # port number
    (?:/(?:(?:[\w~!$&'()*+,;=:@/-]|(?:%[a-f\d]{2}))+|\?[\w%~!$&'()*+,;=:@/?-]*)?)?) 
    """

PHONE_REGEX = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
EMAIL_REGEX = r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+'
NAME_REGEX = r'[a-z]+(\s+[a-z]+)?'