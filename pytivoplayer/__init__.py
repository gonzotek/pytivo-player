# python HME wrapper for launching web pages on series 4 and later units
# Consult http://wmcbrine.com/tivo/ for link to python HME package
# The "weblauncher" folder should go in the top folder of the python HME installation (where the hme.py file resides)
# Before using edit weblauncher/config.ini and put in your 10 digit MAK and 1 or more URLs to list as jumping points

import hme
import logging
import random
import re
import socket
import ssl
import sys
import time
import json
import os
import re

""" python HME wrapper for launching web pages on series 4 and later units. """

body_id = ''
rpc_id = 0
session_id = random.randrange(0x26c000, 0x27dc20)
TITLE = 'PytivoPlayer'

class Pytivoplayer(hme.Application):
    """def get_address(self):
        if not self.addr:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('4.2.2.1', 123))
            self.addr = s.getsockname()[0]
        return socket.inet_aton(self.addr)"""
  
    def startup(self):
        self.MAK = ''
        self.DIR = '.'
        self.URLS = []
        self.parse_config()
        if ( not self.MAK ):
           print 'ERROR: mak not set in config.ini'
        self.tivo_ip = '' + self.context.client_address[0]
        self.params = {'entry': -1, 'return': -1}
        remote = Remote(self)
        """h = self.URLS[self.cur_pos]"""
        """print self.get_address()"""
        remote.Web(self.URLS[0]['url'])

    def parse_config(self):
        self.DIR = os.path.dirname(__file__)
        config = self.DIR + os.path.sep + 'config.ini'
        if (os.path.isfile(config)):
           ifp = open(config, "r")
           key = ''
           for line in ifp:
              if line.strip() == '':
                 continue
              k = re.match(r'^\s*#', line)
              if k:
                 continue
              k = re.match(r'<(.+)>', line)
              if k:
                 key = k.group(1)
                 continue
              if key == "url":
                 fields = (line.strip()).split()
                 h = dict(name=fields[0])
                 if len(fields) > 1:
                    h['url']=fields[1]
                 else:
                    h['url']=fields[0]
                 self.URLS.append(h)
              if key == "mak":
                 self.MAK = line.strip()
           ifp.close()
        else:
           print 'ERROR: no config file found'

      
# RPC functions
class Remote(object):
  def __init__(self, hme):
    self.buf = ''
    self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    cert = hme.DIR + os.path.sep + 'cdata.pem'
    self.ssl_socket = ssl.wrap_socket(self.socket, certfile=cert)
    self.ssl_socket.connect((hme.tivo_ip, 1413))
    self.Auth(hme)
    
  def RpcRequest(self, type, monitor=False, **kwargs):
    global rpc_id
    rpc_id += 1

    headers = '\r\n'.join((
         'Type: request',
         'RpcId: %d' % rpc_id,
         'SchemaVersion: 9',
         'Content-Type: application/json',
         'RequestType: %s' % type,
         'ResponseCount: %s' % (monitor and 'multiple' or 'single'),
         'BodyId: %s' % body_id,
         'X-ApplicationName: Quicksilver',
         'X-ApplicationVersion: 1.2',
         'X-ApplicationSessionId: 0x%x' % session_id,
         )) + '\r\n'

    req_obj = dict(**kwargs)
    req_obj.update({'type': type})

    body = json.dumps(req_obj) + '\n'

    # The "+ 2" is for the '\r\n' we'll add to the headers next.
    start_line = 'MRPC/2 %d %d' % (len(headers) + 2, len(body))

    return '\r\n'.join((start_line, headers, body))
    
  def Read(self):
    start_line = ''
    head_len = None
    body_len = None

    while True:
      self.buf += self.ssl_socket.read(16)
      match = re.match(r'MRPC/2 (\d+) (\d+)\r\n', self.buf)
      if match:
        start_line = match.group(0)
        head_len = int(match.group(1))
        body_len = int(match.group(2))
        break

    need_len = len(start_line) + head_len + body_len
    while len(self.buf) < need_len:
      self.buf += self.ssl_socket.read(1024)
    buf = self.buf[:need_len]
    self.buf = self.buf[need_len:]

    return json.loads(buf[-1 * body_len:])

  def Write(self, data):
    self.ssl_socket.send(data)

  def Auth(self, hme):
    self.Write(self.RpcRequest('bodyAuthenticate',
        credential={
            'type': 'makCredential',
            'key': hme.MAK,
            }
        ))
    result = self.Read()
    if result['status'] != 'success':
      print "ERROR: Authorization failed"

  def Web(self, url):
    uri = 'x-tivo:web:' + url
    req = self.RpcRequest('uiNavigate', uri=uri)

    self.Write(req)
    result = self.Read()
    print 'LAUNCHING %s' % url
    print result
    return result