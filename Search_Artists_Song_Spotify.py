# encoding: utf-8
import sys
import os
import base64
import spotipy
import spotipy.util as util
from utf8_trans import to_utf8, isEnglish
# encoding: utf-8
# -*- coding: utf-8 -*-
# this function is im purose to find the specific artist's song
# specially spend time to deal with tranfer chinese to to uncoide and
# search , change the uncoide backinto chinese

scope = 'playlist-modify-public'
sp = spotipy.Spotify()

class Search_Singers_Song(object):

    def __init__(self, singer, song):
        self.singer = singer
        self.song = song

    def get_song_uri(self):
        global sp
        if not isEnglish(self.song):
            self.song = to_utf8(self.song)
        results = sp.search(q='track:' + self.song, type='track')
        items = results["tracks"]["items"]

        for item in items:
            # print item['artists'][0]['name'].encode('utf8', 'ignore').lower(),
            # print self.singer
            if item['artists'][0]['name'].encode('utf8', 'ignore').lower() == self.singer.lower():
                return (True, item['artists'][0]['name'].encode('utf8', 'ignore').lower(), item['uri'], item['id'])
        return [False, self.song, self.singer]
