# -*- coding: utf-8 -*-
import sys
import spotipy
import spotipy.util as util
from utf8_trans import *
idd = '8e18b60279e24176b47fc07f62b79a58'
sec = '77b157039d304a46926633481274985f'
web = 'http://www.cnn.com/'
scope = 'user-library-read'


# token = util.prompt_for_user_token(
    # client_id=idd, client_secret=sec, redirect_uri=web, username='zhang435', scope=scope)

sp = spotipy.Spotify()
results = sp.search(q='artist:' + to_utf8('Stefanie Sun'), type='artist')
if  results:
    print results['artists']['items'][0]['name']
else:
    print(1)
