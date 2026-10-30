"""Extend the renamed booklet font from an OFL Fontsource Noto Sans SC archive.

Usage: python3 scripts/extend-booklet-font.py archive.tgz public-character-set.txt
No network requests or package code execution. Keep the existing OFL notices.
Requires fontTools; Fontsource's woff assets use standard zlib compression.
"""
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import sys
import tarfile
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.merge import Merger

archive_path, character_path = map(Path, sys.argv[1:3])
target = Path(__file__).resolve().parents[1] / 'public/fonts/ScenicSansSC-Regular.ttf'
original = TTFont(target)
old_codes = set(original.getBestCmap())
wanted = {ord(c) for c in character_path.read_text() if ord(c) > 31}
missing = wanted - old_codes
if not missing:
    print('Booklet font already covers the supplied characters.')
    sys.exit(0)

# The PDF uses horizontal text and precomposed characters. Drop shaping tables
# consistently across supplements to avoid retaining mismatched lookup indexes.
drop = ['BASE', 'GDEF', 'GPOS', 'GSUB', 'STAT']
with TemporaryDirectory(prefix='scenicdue-font-') as temporary:
    folder = Path(temporary)
    for tag in drop:
        if tag in original:
            del original[tag]
    original.save(folder / 'base.ttf')
    parts = [str(folder / 'base.ttf')]
    with tarfile.open(archive_path, 'r:gz') as archive:
        members = [m for m in archive.getmembers() if m.isfile() and m.name.endswith('-400-normal.woff')]
        for member in members:
            font = TTFont(BytesIO(archive.extractfile(member).read()))
            found = missing & set(font.getBestCmap())
            if not found:
                continue
            options = subset.Options()
            options.drop_tables += drop
            cutter = subset.Subsetter(options=options)
            cutter.populate(unicodes=found)
            cutter.subset(font)
            font.flavor = None
            path = folder / ('part-' + str(len(parts)) + '.ttf')
            font.save(path)
            parts.append(str(path))
            missing -= found
            if not missing:
                break
    if missing:
        raise RuntimeError('Official archive lacks requested code points: ' + ','.join(hex(c) for c in sorted(missing)))
    merged = Merger().merge(parts)
    for entry in merged['name'].names:
        replacements = {1: 'Scenic Sans SC', 2: 'Regular', 3: 'Scenic Sans SC Regular', 4: 'Scenic Sans SC Regular', 6: 'ScenicSansSC-Regular', 16: 'Scenic Sans SC', 17: 'Regular'}
        if entry.nameID in replacements:
            entry.string = replacements[entry.nameID].encode(entry.getEncoding(), errors='replace')
    result = folder / 'result.ttf'
    merged.save(result)
    checked = set(TTFont(result).getBestCmap())
    if not (old_codes | wanted) <= checked:
        raise RuntimeError('Coverage validation failed; original font left unchanged.')
    target.write_bytes(result.read_bytes())
    print('Extended booklet font; retained all previous glyphs and covered the supplied public catalogue.')
