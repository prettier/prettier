@Client.event_stream
class UserStream(EventStream):
    def stream_request(self):
        return self.stream.statuses.filter.post(track="#europython,europython")

    @events.on_connect.handler
    @events.on_tweet.handler
    def tweet(self, data):
        if data.retweeted or 'RT @' in data.text:
            return
