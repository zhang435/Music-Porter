# this function enable user to search the song and artist name in chinese


def to_utf8(text):
    if isinstance(text, unicode):
        # unicode to utf-8
        return text.encode('utf-8')
    try:
        # maybe utf-8
        return text.decode('utf-8').encode('utf-8')
    except UnicodeError:
        # gbk to utf-8
        return text.decode('gbk').encode('utf-8')


def isEnglish(s):
    try:
        s.decode('ascii')
    except UnicodeDecodeError:
        return False
    else:
        return True
