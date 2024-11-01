def read_uint32_be(f):
    return int.from_bytes(f.read(4), byteorder='big')


def read_uint64_be(f):
    return int.from_bytes(f.read(8), byteorder='big')


def read_box_type(f):
    box_type = f.read(4).decode('utf-8')
    return box_type


def read_ext_type(f):
    return f.read(16)


def read_mp4_boxes(file_path):
    def read_box(f):
        pos = f.tell()
        size = read_uint32_be(f)
        if size == 0:
            return None, None, None
        box_type = read_box_type(f)
        return pos, size, box_type

    boxes = []
    with open(file_path, 'rb') as f:
        while True:
            box_pos, box_size, box_type = read_box(f)
            if box_size is None:
                break
            boxes.append({
                'position': box_pos,
                'size': box_size,
                'type': box_type
            })
            f.seek(box_pos + box_size)
    return boxes


def read_uuid_box(file_path, uuid_box):
    with open(file_path, 'rb') as f:
        f.seek(uuid_box['position'])
        size = read_uint32_be(f)
        box_type = read_box_type(f)
        # ext_type должен быть ['0x17', '0x8c', '0xce', '0xde', '0x52', '0x7b', '0x49', '0x57', '0x92', '0x20', '0xb5', '0x27', '0x10', '0x83', '0x47', '0x47']
        ext_type = read_ext_type(f)
        offset = read_uint64_be(f)
        ext_type_str = [hex(b) for b in ext_type]
        return {
            'size': size,
            'box_type': box_type,
            'ext_type': ext_type,
            'ext_type_str': ext_type_str,
            'offset': offset
        }


def cut_tail_and_write_file(file_path, offset_from_start, output_path):
    with open(file_path, 'rb') as src:
        src.seek(offset_from_start)
        with open(output_path, 'wb') as dst:
            while True:
                data = src.read(4096)
                if not data:
                    break
                dst.write(data)

if __name__ == '__main__':
    filepath = './flac-mp4-1'
    boxes = read_mp4_boxes(filepath)
    uuid_box = next(filter(lambda b: b['type'] == 'uuid', boxes), None)
    if uuid_box:
        print(uuid_box)
        uuid_box_data = read_uuid_box(filepath, uuid_box)
        print(uuid_box_data)
        # filepath_fmp4 = './fmp4.mp4'
        # cut_tail_and_write_file(filepath, uuid_box_data['offset'], filepath_fmp4)
