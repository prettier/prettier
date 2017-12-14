async def example():
    await channel.put(json.dumps({
        'text': data.text,
        'image': image,
        'username': data.user.screen_name,
    }))