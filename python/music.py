from winsdk.windows.media.control import \
    GlobalSystemMediaTransportControlsSessionManager as MediaManager
from winsdk.windows.storage.streams import DataReader
from PIL import Image
from datetime import timedelta
import os, sys, io, re, asyncio, tempfile
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def getMedia():
    sessions = await MediaManager.request_async()

    currentSession = sessions.get_current_session()
    if not currentSession:
        return None

    info = await currentSession.try_get_media_properties_async()
    info_dict = {song_attr: info.__getattribute__(song_attr) for song_attr in dir(info) if song_attr[0] != '_'}

    # converts winrt vector to list
    info_dict['genres'] = list(info_dict['genres'])

    pbinfo = currentSession.get_playback_info()

    info_dict['status'] = pbinfo.playback_status

    tlprops = currentSession.get_timeline_properties()

    if tlprops.end_time != timedelta(0):
        info_dict['pos'] = tlprops.position
        info_dict['end'] = tlprops.end_time

    return info_dict

async def save_thumbnail_to_temp(thumbnail_stream_ref, filename='thumbnail.png'):
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, filename)

    stream = await thumbnail_stream_ref.open_read_async()
    size = stream.size
    reader = DataReader(stream)
    await reader.load_async(size)
    buffer = reader.read_buffer(size)

    byte_array = bytes(buffer)
    image = Image.open(io.BytesIO(byte_array))
    image.save(output_path)
    return output_path


def main():
    currentMedia = asyncio.run(getMedia())

    if currentMedia is None:
        return print("np")

    dataStruct = {
        "Author": currentMedia["artist"],
        "Title": currentMedia["title"],
    }
    if currentMedia.get("pos") is None:
        dataStruct["Position"] = ["LIVE"]
    else:
        dataStruct["Position"] = [currentMedia["pos"], currentMedia["end"]]

    title = re.sub(r'[<>:"/\\|?*]', '', f"{currentMedia["title"]}.png")
    tempPath = os.path.join(tempfile.gettempdir(), title)
    if os.path.exists(tempPath):
        dataStruct["Thumbnail"] = tempPath
    elif currentMedia["thumbnail"] is not None:
        temp = asyncio.run(save_thumbnail_to_temp(currentMedia["thumbnail"], title))
        dataStruct["Thumbnail"] = temp

    return print(dataStruct)

main()